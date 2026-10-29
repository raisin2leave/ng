export type UserRole = 'customer' | 'admin';

export type Address = {
  street: string;
  buildingNumber: string;
  apartmentNumber?: string;
  postalCode: string;
  city: string;
};

export type UserAccountBase = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type CustomerAccount = UserAccountBase & {
  role: 'customer';
  deliveryAddress: Address;
};

export type AdminAccount = UserAccountBase & {
  role: 'admin';
};

export type UserAccount = CustomerAccount | AdminAccount;

export type CustomerProfile = Omit<CustomerAccount, 'password'>;
export type AdminProfile = Omit<AdminAccount, 'password'>;
export type UserProfile = CustomerProfile | AdminProfile;

export type StoredUser = UserProfile & {
  passwordHash: string;
};

export type CustomerRegistration = {
  name: string;
  email: string;
  password: string;
  phone: string;
  deliveryAddress: Address;
};

export type AdminRegistration = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export type ProfileChanges = {
  name: string;
  email: string;
  phone: string;
  deliveryAddress?: Address;
};
