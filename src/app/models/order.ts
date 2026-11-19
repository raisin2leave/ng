import { Address } from './user';

export type OrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'in-delivery'
  | 'delivered'
  | 'cancelled';

export const orderStatuses: { value: OrderStatus; label: string }[] = [
  { value: 'new', label: 'Nowe' },
  { value: 'accepted', label: 'Przyjęte' },
  { value: 'preparing', label: 'W przygotowaniu' },
  { value: 'ready', label: 'Gotowe' },
  { value: 'in-delivery', label: 'W dostawie' },
  { value: 'delivered', label: 'Dostarczone' },
  { value: 'cancelled', label: 'Anulowane' },
];

export type PaymentMethod = 'online' | 'on-delivery';

export const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'online', label: 'Płatność online' },
  { value: 'on-delivery', label: 'Płatność przy odbiorze' },
];

export type OrderItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

export type OrderContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type CheckoutData = {
  contact: OrderContact;
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
};

export type Order = CheckoutData & {
  id: number;
  userId: string;
  createdAt: string;
  restaurantId: number;
  restaurantName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discountCode?: string;
  discount?: number;
  total: number;
  status: OrderStatus;
};

export function statusLabel(status: OrderStatus) {
  for (const option of orderStatuses) {
    if (option.value === status) {
      return option.label;
    }
  }

  return status;
}

export function statusBadgeClass(status: OrderStatus) {
  if (status === 'delivered') {
    return 'text-bg-success';
  }

  if (status === 'cancelled') {
    return 'text-bg-secondary';
  }

  if (status === 'new') {
    return 'text-bg-primary';
  }

  return 'text-bg-warning';
}

export function paymentLabel(method: PaymentMethod) {
  for (const option of paymentMethods) {
    if (option.value === method) {
      return option.label;
    }
  }

  return method;
}
