import { useQuery } from '@apollo/client';
import { GET_CUSTOMER_ORDERS } from '../../utils/gql/GQL_QUERIES';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  total: string;
  date: string;
}

/**
 * Customer account component that displays user's orders
 * @function CustomerAccount
 * @returns {JSX.Element} - Rendered component with order history
 */
const CustomerAccount = () => {
  const { loading, error, data } = useQuery(GET_CUSTOMER_ORDERS);

  if (loading) return <LoadingSpinner />;
  if (error) return <p>Error: {error.message}</p>;

  const orders = data?.customer?.orders?.nodes;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      {orders && orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Order Number</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: Order) => (
                <tr key={order.id}>
                  <td className="py-2 px-4 border-b">{order.orderNumber}</td>
                  <td className="py-2 px-4 border-b">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border-b">{order.status}</td>
                  <td className="py-2 px-4 border-b">{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>You have no orders.</p>
      )}
    </div>
  );
};

export default CustomerAccount;
