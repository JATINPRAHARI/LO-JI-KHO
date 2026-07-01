import type { OrderStatus } from '../../types/database';
import { Badge } from '../ui/Badge';

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'amber' }> = {
  payment_pending: { label: 'Payment Pending', variant: 'warning' },
  waiting_verification: { label: 'Verifying Payment', variant: 'info' },
  accepted: { label: 'Accepted', variant: 'amber' },
  preparing: { label: 'Preparing', variant: 'amber' },
  ready: { label: 'Ready', variant: 'success' },
  out_for_delivery: { label: 'Out for Delivery', variant: 'info' },
  delivered: { label: 'Delivered', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'error' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status] ?? { label: status, variant: 'default' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
