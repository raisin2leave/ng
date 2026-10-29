import { TestBed } from '@angular/core/testing';
import { Users } from './users';
import { CustomerRegistration } from '../models/user';

const newCustomer: CustomerRegistration = {
  name: 'Anna Nowak',
  email: '  Anna@Example.com ',
  password: 'tajne-haslo-1',
  phone: '',
  deliveryAddress: {
    street: 'Marszałkowska',
    buildingNumber: '10',
    apartmentNumber: '5',
    postalCode: '00-001',
    city: 'Warszawa',
  },
};

describe('Users service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start with the test admin and never expose password hashes', () => {
    const service = TestBed.inject(Users);
    const all = service.getAll()();

    expect(all.length).toBe(1);
    expect(all[0].role).toBe('admin');
    expect('passwordHash' in all[0]).toBe(false);
    expect('password' in all[0]).toBe(false);
  });

  it('should register a customer with a hashed password and the customer role', () => {
    const service = TestBed.inject(Users);
    const created = service.registerCustomer(newCustomer)!;

    expect(created.role).toBe('customer');
    expect(created.email).toBe('anna@example.com');

    const saved = localStorage.getItem('foodapp-users')!;
    expect(saved).not.toContain('tajne-haslo-1');
    expect(saved).toContain('$2b$10$');
  });

  it('should refuse a second account with the same e-mail', () => {
    const service = TestBed.inject(Users);
    service.registerCustomer(newCustomer);

    expect(service.registerCustomer({ ...newCustomer, email: 'ANNA@example.com' })).toBeUndefined();
    expect(service.getAll()().length).toBe(2);
  });

  it('should find a user only with the right password', () => {
    const service = TestBed.inject(Users);
    service.registerCustomer(newCustomer);

    expect(service.findByLogin('anna@example.com', 'tajne-haslo-1')?.name).toBe('Anna Nowak');
    expect(service.findByLogin('anna@example.com', 'zle-haslo')).toBeUndefined();
    expect(service.findByLogin('admin@foodapp.pl', 'Admin123!')?.role).toBe('admin');
  });

  it('should update a profile without changing the role, and keep e-mails unique', () => {
    const service = TestBed.inject(Users);
    const anna = service.registerCustomer(newCustomer)!;

    expect(
      service.updateProfile(anna.id, { name: 'Anna', email: 'admin@foodapp.pl', phone: '' }),
    ).toBe(false);

    expect(
      service.updateProfile(anna.id, {
        name: 'Anna Kowalska',
        email: 'anna.k@example.com',
        phone: '600100200',
        deliveryAddress: { ...newCustomer.deliveryAddress, city: 'Kraków' },
      }),
    ).toBe(true);

    const updated = service.getById(anna.id)!;
    expect(updated.name).toBe('Anna Kowalska');
    expect(updated.role).toBe('customer');
    expect(updated.role === 'customer' && updated.deliveryAddress.city).toBe('Kraków');
  });

  it('should reset a password and delete a user', () => {
    const service = TestBed.inject(Users);
    const anna = service.registerCustomer(newCustomer)!;

    service.resetPassword(anna.id, 'nowe-haslo-2');
    expect(service.findByLogin('anna@example.com', 'tajne-haslo-1')).toBeUndefined();
    expect(service.findByLogin('anna@example.com', 'nowe-haslo-2')).toBeDefined();

    service.deleteUser(anna.id);
    expect(service.getById(anna.id)).toBeUndefined();
  });
});
