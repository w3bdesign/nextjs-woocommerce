const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, '..', 'public', 'cabinet.glb');
const OUTPUT = path.join(__dirname, '..', 'public', 'cabinets_merged.glb');

// CLI args
const argv = require('minimist')(process.argv.slice(2));
const GAP = Number(argv.gap || argv._[0] || 0); // gap between models (units)
const AXIS = (argv.axis || 'x').toLowerCase(); // 'x','y' or 'z'

function readGLB(buffer) {
  const header = buffer.slice(0, 12);
  const magic = header.toString('utf8', 0, 4);
  if (magic !== 'glTF') throw new Error('Not a GLB');
  const version = header.readUInt32LE(4);
  const length = header.readUInt32LE(8);

  let offset = 12;
  const chunks = [];
  while (offset < length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    offset += 8;
    const chunkData = buffer.slice(offset, offset + chunkLength);
    chunks.push({ chunkType, chunkData });
    offset += chunkLength;
  }

  const jsonChunk = chunks.find((c) => c.chunkType === 0x4e4f534a);
  const binChunk = chunks.find(
    (c) => c.chunkType === 0x004e4942 || c.chunkType === 0,
  );
  const jsonText = jsonChunk.chunkData.toString('utf8');
  const json = JSON.parse(jsonText);
  return { json, binChunk, header: { version, length } };
}

function writeGLB(jsonObj, binChunk, outPath) {
  const jsonText = JSON.stringify(jsonObj);
  let jsonBuf = Buffer.from(jsonText, 'utf8');
  const jsonPad = (4 - (jsonBuf.length % 4)) % 4;
  if (jsonPad) jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc(jsonPad, 0x20)]);

  const binBuf = binChunk ? binChunk.chunkData : Buffer.alloc(0);
  const binPad = (4 - (binBuf.length % 4)) % 4;
  const binBufPadded = binPad
    ? Buffer.concat([binBuf, Buffer.alloc(binPad)])
    : binBuf;

  const header = Buffer.alloc(12);
  header.write('glTF', 0, 'utf8');
  header.writeUInt32LE(2, 4); // version

  const totalLength =
    12 +
    8 +
    jsonBuf.length +
    (binBufPadded.length ? 8 + binBufPadded.length : 0);
  header.writeUInt32LE(totalLength, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonBuf.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4);

  let parts = [header, jsonChunkHeader, jsonBuf];

  if (binBufPadded.length) {
    const binChunkHeader = Buffer.alloc(8);
    binChunkHeader.writeUInt32LE(binBufPadded.length, 0);
    binChunkHeader.writeUInt32LE(0x004e4942, 4);
    parts.push(binChunkHeader, binBufPadded);
  }

  fs.writeFileSync(outPath, Buffer.concat(parts));
}

function computeLocalAccessorBounds(accessors, mesh) {
  // returns {min: [x,y,z], max: [x,y,z]} combining primitives
  let overallMin = [Infinity, Infinity, Infinity];
  let overallMax = [-Infinity, -Infinity, -Infinity];
  for (const prim of mesh.primitives || []) {
    const posIndex = prim.attributes && prim.attributes.POSITION;
    if (posIndex == null) continue;
    const acc = accessors[posIndex];
    if (!acc) continue;
    const min = acc.min || acc._min;
    const max = acc.max || acc._max;
    if (!min || !max) continue;
    for (let i = 0; i < 3; i++) {
      overallMin[i] = Math.min(overallMin[i], min[i]);
      overallMax[i] = Math.max(overallMax[i], max[i]);
    }
  }
  if (!isFinite(overallMin[0])) return null;
  return { min: overallMin, max: overallMax };
}

function multiplyMat4Vec3(mat, v) {
  const x = v[0],
    y = v[1],
    z = v[2];
  const w = mat[3] * x + mat[7] * y + mat[11] * z + mat[15];
  const nx = (mat[0] * x + mat[4] * y + mat[8] * z + mat[12]) / (w || 1);
  const ny = (mat[1] * x + mat[5] * y + mat[9] * z + mat[13]) / (w || 1);
  const nz = (mat[2] * x + mat[6] * y + mat[10] * z + mat[14]) / (w || 1);
  return [nx, ny, nz];
}

function composeTRS(node) {
  // returns 4x4 column-major matrix as array[16]
  if (node.matrix) return node.matrix.slice();
  const t = node.translation || [0, 0, 0];
  const r = node.rotation || [0, 0, 0, 1]; // quaternion
  const s = node.scale || [1, 1, 1];
  // compute matrix
  const x = r[0],
    y = r[1],
    z = r[2],
    w = r[3];
  const x2 = x + x,
    y2 = y + y,
    z2 = z + z;
  const xx = x * x2,
    xy = x * y2,
    xz = x * z2;
  const yy = y * y2,
    yz = y * z2,
    zz = z * z2;
  const wx = w * x2,
    wy = w * y2,
    wz = w * z2;
  const mat = [
    (1 - (yy + zz)) * s[0],
    (xy + wz) * s[0],
    (xz - wy) * s[0],
    0,
    (xy - wz) * s[1],
    (1 - (xx + zz)) * s[1],
    (yz + wx) * s[1],
    0,
    (xz + wy) * s[2],
    (yz - wx) * s[2],
    (1 - (xx + yy)) * s[2],
    0,
    t[0],
    t[1],
    t[2],
    1,
  ];
  return mat;
}

function multiplyMat4(a, b) {
  const out = new Array(16).fill(0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + j] * b[i * 4 + k];
      out[i * 4 + j] = sum;
    }
  }
  return out;
}

function computeWorldAABB(json) {
  const nodes = json.nodes || [];
  const accessors = json.accessors || [];
  const meshes = json.meshes || [];

  // build parent map to find world matrices
  const parent = new Array(nodes.length).fill(-1);
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (!n || !n.children) continue;
    for (const c of n.children) parent[c] = i;
  }

  // compute local TRS matrices
  const localMats = nodes.map((n) => (n ? composeTRS(n) : null));

  // compute world matrices by walking up parents (cache)
  const worldMats = new Array(nodes.length).fill(null);
  function getWorld(i) {
    if (worldMats[i]) return worldMats[i];
    const p = parent[i];
    const local = localMats[i] || [
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    ];
    if (p >= 0) {
      const wm = multiplyMat4(getWorld(p), local);
      worldMats[i] = wm;
      return wm;
    } else {
      worldMats[i] = local;
      return local;
    }
  }

  let globalMin = [Infinity, Infinity, Infinity];
  let globalMax = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (!n) continue;
    if (typeof n.mesh !== 'number') continue;
    const mesh = meshes[n.mesh];
    if (!mesh) continue;
    const bounds = computeLocalAccessorBounds(accessors, mesh);
    if (!bounds) continue;
    // generate 8 corners and transform by world matrix
    const wm = getWorld(i);
    const corners = [
      [bounds.min[0], bounds.min[1], bounds.min[2]],
      [bounds.min[0], bounds.min[1], bounds.max[2]],
      [bounds.min[0], bounds.max[1], bounds.min[2]],
      [bounds.min[0], bounds.max[1], bounds.max[2]],
      [bounds.max[0], bounds.min[1], bounds.min[2]],
      [bounds.max[0], bounds.min[1], bounds.max[2]],
      [bounds.max[0], bounds.max[1], bounds.min[2]],
      [bounds.max[0], bounds.max[1], bounds.max[2]],
    ];
    for (const c of corners) {
      const tc = multiplyMat4Vec3(wm, c);
      for (let k = 0; k < 3; k++) {
        globalMin[k] = Math.min(globalMin[k], tc[k]);
        globalMax[k] = Math.max(globalMax[k], tc[k]);
      }
    }
  }

  if (!isFinite(globalMin[0])) return null;
  return { min: globalMin, max: globalMax };
}

function findFirstMeshIndexUsedByNodes(json) {
  if (!json.nodes) return null;
  for (let i = 0; i < json.nodes.length; i++) {
    const n = json.nodes[i];
    if (n && typeof n.mesh === 'number') return n.mesh;
  }
  // fallback to first mesh
  if (json.meshes && json.meshes.length) return 0;
  return null;
}

function main() {
  const buf = fs.readFileSync(INPUT);
  const { json, binChunk } = readGLB(buf);

  json.nodes = json.nodes || [];
  json.scenes = json.scenes || [{ nodes: [] }];
  const scene = json.scenes[0];
  scene.nodes = scene.nodes || [];

  const aabb = computeWorldAABB(json);
  if (!aabb) {
    console.warn(
      'Could not compute world AABB from accessors — falling back to simple width=0',
    );
  }

  const axisIndex = AXIS === 'x' ? 0 : AXIS === 'y' ? 1 : 2;
  const width = aabb ? aabb.max[axisIndex] - aabb.min[axisIndex] : 0;
  if (width === 0)
    console.warn('Computed width 0 — result may overlap or be incorrect.');

  // Duplicate entire node array (deep clone of node objects), remap children indices
  const origNodes = json.nodes.slice();
  const N = origNodes.length;
  const cloned = origNodes.map((n) => {
    if (!n) return n;
    const copy = JSON.parse(JSON.stringify(n));
    if (copy.children) copy.children = copy.children.map((c) => c + N);
    return copy;
  });

  // append cloned nodes
  for (const c of cloned) json.nodes.push(c);

  // find root indices in original scene (those referenced by scene.nodes)
  const origRootIndices = scene.nodes.slice();
  const appendedRootIndices = origRootIndices.map((r) => r + N);

  // Create parent node that holds appended roots and translates them by width+GAP along axis
  const offset = width + GAP;
  const parentNode = { children: appendedRootIndices };
  if (!Number.isNaN(offset) && isFinite(offset)) {
    if (axisIndex === 0) parentNode.translation = [offset, 0, 0];
    else if (axisIndex === 1) parentNode.translation = [0, offset, 0];
    else parentNode.translation = [0, 0, offset];
  }

  const parentIndex = json.nodes.length;
  json.nodes.push(parentNode);
  scene.nodes.push(parentIndex);

  writeGLB(json, binChunk, OUTPUT);
  console.log(
    'Wrote',
    OUTPUT,
    '(width =',
    width,
    ', gap =',
    GAP,
    ', axis =',
    AXIS,
    ')',
  );
}

main();
