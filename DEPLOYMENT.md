# Deployment Configuration

## Render.com Deployment

This project is configured for deployment on Render.com using their **free tier** with Infrastructure as Code (Blueprints).

### Service Details

- **Service Name**: mebl
- **Type**: Web Service
- **Runtime**: Node.js
- **Plan**: Free
- **Region**: Frankfurt
- **Node Version**: 22.16.0

### Build & Start Commands

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`

### Deployment Configuration File

The deployment is managed via `render.yaml` in the root directory, which defines all infrastructure as code.

## Environment Variables

### Required Variables (Must be set in Render Dashboard)

When you set up the Blueprint on Render, you'll be prompted to provide values for these variables marked with `sync: false`:

#### Core GraphQL Configuration

- `NEXT_PUBLIC_GRAPHQL_URL`
  - Value: `https://wordpress2533583.home.pl/graphql`
  - Description: WPGraphQL endpoint for WordPress backend

#### Optional: Algolia Search

- `NEXT_PUBLIC_ALGOLIA_APP_ID` (if using Algolia search)
- `NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY` (if using Algolia search)

#### Optional: WooCommerce REST API

- `WOO_REST_API_URL`
  - Value: `https://wordpress2533583.home.pl/wp-json/wc/v3`
- `WOO_CONSUMER_KEY`
  - Value: `ck_dd6ccad3e7960414630b4494dec6b69293ff6e0b`
- `WOO_CONSUMER_SECRET`
  - Value: `cs_e5942d9926ca9e0edae47c582c3c408c1ba9330a`

### Pre-configured Variables (Hardcoded in render.yaml)

These are already set in the `render.yaml` file:

- `NEXT_PUBLIC_ENABLE_MOCKS='true'` (set to 'false' in production)
- `NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL`
- `NEXT_PUBLIC_PLACEHOLDER_LARGE_IMAGE_URL`
- `NEXT_PUBLIC_ALGOLIA_INDEX_NAME='algolia'`
- `NODE_VERSION='22.16.0'`

## WooCommerce API Credentials

### WordPress/WooCommerce Backend

- **URL**: https://wordpress2533583.home.pl
- **GraphQL Endpoint**: https://wordpress2533583.home.pl/graphql
- **WooCommerce REST API**: https://wordpress2533583.home.pl/wp-json/wc/v3

### API Authentication

- **Consumer Key**: `ck_dd6ccad3e7960414630b4494dec6b69293ff6e0b`
- **Consumer Secret**: `cs_e5942d9926ca9e0edae47c582c3c408c1ba9330a`

### Testing the API

```bash
# Test with curl
curl -u "ck_dd6ccad3e7960414630b4494dec6b69293ff6e0b:cs_e5942d9926ca9e0edae47c582c3c408c1ba9330a" \
  https://wordpress2533583.home.pl/wp-json/wc/v3/products

# Test GraphQL endpoint
curl https://wordpress2533583.home.pl/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ products { nodes { name } } }"}'
```

## Deployment Steps

### Initial Setup on Render.com

1. **Connect Repository**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" > "Blueprint"
   - Connect your GitHub/GitLab repository
   - Select the branch to deploy (e.g., `master`)

2. **Blueprint Configuration**
   - Render will automatically detect `render.yaml`
   - Review the resources that will be created
   - You'll be prompted to enter secret environment variables

3. **Set Secret Environment Variables**
   When prompted, provide:
   - `NEXT_PUBLIC_GRAPHQL_URL`: `https://wordpress2533583.home.pl/graphql`
   - Optionally set Algolia credentials if you're using search
   - Optionally set WooCommerce REST credentials if needed

4. **Deploy**
   - Click "Apply" to create and deploy your service
   - Render will run the build and start commands
   - Your app will be available at `https://mebl.onrender.com` (or your custom domain)

### Updating Environment Variables

1. Navigate to your service in the Render Dashboard
2. Click "Environment" in the left sidebar
3. Add or modify environment variables
4. Choose deploy option:
   - **Save, rebuild, and deploy**: Full rebuild with new env vars
   - **Save and deploy**: Redeploy existing build with new env vars
   - **Save only**: Save without deploying

### Manual Deployment

To trigger a manual deployment:

1. Push changes to your connected branch
2. Or click "Manual Deploy" in the Render Dashboard
3. Or use the Render API/CLI

### Monitoring

- **Logs**: Available in the Render Dashboard under "Logs"
- **Metrics**: View service metrics in the Dashboard
- **Health Checks**: Automatically monitored by Render

## Render.com Free Tier Limitations

- Service spins down after 15 minutes of inactivity
- First request after spin-down may take 30+ seconds
- 750 hours/month of free usage (enough for one service)
- Automatic HTTPS
- Custom domains supported

## Troubleshooting

### Service Won't Start

- Check build logs in Render Dashboard
- Verify all required environment variables are set
- Ensure `NEXT_PUBLIC_GRAPHQL_URL` is accessible

### GraphQL Connection Issues

- Test the GraphQL endpoint manually
- Verify WordPress plugins are installed and activated:
  - WooCommerce
  - WPGraphQL
  - WPGraphQL WooCommerce

### Environment Variable Not Working

- Verify the variable name starts with `NEXT_PUBLIC_` for client-side access
- Rebuild and redeploy after changing env vars
- Check if the variable is marked `sync: false` in render.yaml

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Blueprint Specification](https://render.com/docs/blueprint-spec)
- [Environment Variables Guide](https://render.com/docs/configure-environment-variables)
- [Free Tier Details](https://render.com/docs/free)
