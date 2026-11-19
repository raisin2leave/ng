import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RestaurantForm } from './restaurant-form';
import { API_URL } from '../api';
import { answerRestaurantList, fakeServer, provideTestApi, restaurantFromSeed, settle } from '../testing/api-test';

describe('RestaurantForm', () => {
  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'admin', children: [] }]), ...provideTestApi()],
    });
    await answerRestaurantList();
  });

  afterEach(() => {
    fakeServer().verify();
  });

  function openForm(id?: string) {
    const fixture = TestBed.createComponent(RestaurantForm);
    if (id !== undefined) {
      fixture.componentRef.setInput('id', id);
    }
    fixture.detectChanges();
    const page: HTMLElement = fixture.nativeElement;
    return { fixture, page };
  }

  function typeInto(page: HTMLElement, selector: string, value: string) {
    const field = page.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  function submit(page: HTMLElement) {
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
  }

  it('should have all fields required by the lab', () => {
    const { page } = openForm();
    const ids = [...page.querySelectorAll('input, textarea, select')].map((el) => el.id);
    expect(ids).toEqual([
      'name',
      'description',
      'cuisine',
      'address',
      'imageUrl',
      'deliveryTimeMin',
      'deliveryTimeMax',
      'deliveryFee',
      'minimumOrderValue',
      'isActive',
    ]);
  });

  it('should POST a new restaurant to the API and go back to the admin list', async () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');
    const { page } = openForm();

    typeInto(page, '#name', 'Nowa Pizzeria');
    typeInto(page, '#description', 'Pizza z pieca opalanego drewnem.');
    typeInto(page, '#deliveryFee', '7.5');
    submit(page);

    const request = fakeServer().expectOne(`${API_URL}/restaurants`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(
      expect.objectContaining({ name: 'Nowa Pizzeria', deliveryFee: 7.5, rating: 0 }),
    );
    expect(navigateSpy).not.toHaveBeenCalled();

    request.flush({ ...request.request.body, id: 201 });
    await settle();

    expect(navigateSpy).toHaveBeenCalledWith(['/admin']);
  });

  it('should open an existing restaurant pre-filled and PATCH the changes', async () => {
    const { page } = openForm('1');

    expect(page.querySelector('h1')?.textContent).toContain('Edytuj restaurację');
    const name = page.querySelector<HTMLInputElement>('#name')!;
    expect(name.value).toBe('Pierogarnia Pod Aniołami');

    typeInto(page, '#name', 'Pierogarnia Zmieniona');
    submit(page);

    const request = fakeServer().expectOne(`${API_URL}/restaurants/1`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body.name).toBe('Pierogarnia Zmieniona');
    expect(request.request.body.cuisine).toBe('polish');
    request.flush({ ...restaurantFromSeed(1), name: 'Pierogarnia Zmieniona' });
    await settle();
  });

  it('should keep the form and show a message when saving fails', async () => {
    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');
    const { fixture, page } = openForm('1');

    submit(page);
    fixture.detectChanges();
    expect(page.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);

    fakeServer().expectOne(`${API_URL}/restaurants/1`).flush('down', { status: 503, statusText: 'Unavailable' });
    await settle();
    fixture.detectChanges();

    expect(page.textContent).toContain('Nie udało się zapisać restauracji.');
    expect(page.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should show a message for an unknown restaurant', () => {
    const { page } = openForm('9999');
    expect(page.textContent).toContain('Nie znaleziono restauracji.');
    expect(page.querySelector('form')).toBeNull();
  });

  describe('validation (FR-05)', () => {
    function errorTexts(page: HTMLElement) {
      return [...page.querySelectorAll('.invalid-feedback')].map((e) => e.textContent?.trim());
    }

    it('should not send an empty form and should show what is wrong', () => {
      const { fixture, page } = openForm();
      expect(errorTexts(page)).toEqual([]);

      submit(page);
      fixture.detectChanges();

      fakeServer().expectNone(`${API_URL}/restaurants`);
      expect(errorTexts(page)).toContain('Nazwa jest wymagana.');
      expect(errorTexts(page)).toContain('Opis jest wymagany.');
      expect(page.textContent).toContain('Popraw błędy w formularzu, aby zapisać.');
      expect(page.querySelector('#name')!.classList).toContain('is-invalid');
    });

    it('should check name and description length', () => {
      const { fixture, page } = openForm();
      typeInto(page, '#name', 'AB');
      typeInto(page, '#description', 'Za krótki');
      submit(page);
      fixture.detectChanges();

      expect(errorTexts(page)).toContain('Nazwa musi mieć co najmniej 3 znaki.');
      expect(errorTexts(page)).toContain('Opis musi mieć co najmniej 20 znaków.');
    });

    it('should check delivery fee, minimum order value and delivery times', () => {
      const { fixture, page } = openForm();
      typeInto(page, '#name', 'Poprawna nazwa');
      typeInto(page, '#description', 'Poprawny opis restauracji testowej.');
      typeInto(page, '#deliveryFee', '-5');
      typeInto(page, '#minimumOrderValue', '');
      typeInto(page, '#deliveryTimeMin', '40');
      typeInto(page, '#deliveryTimeMax', '20');
      submit(page);
      fixture.detectChanges();

      fakeServer().expectNone(`${API_URL}/restaurants`);
      expect(errorTexts(page)).toEqual([
        'Czas „do” nie może być krótszy niż czas „od”.',
        'Koszt dostawy nie może być ujemny.',
        'Podaj minimalną wartość zamówienia.',
      ]);
    });

    it('should allow a delivery fee of 0 (free delivery)', async () => {
      const { page } = openForm();
      typeInto(page, '#name', 'Darmowa dostawa');
      typeInto(page, '#description', 'Restauracja z darmową dostawą do domu.');
      typeInto(page, '#deliveryFee', '0');
      submit(page);

      const request = fakeServer().expectOne(`${API_URL}/restaurants`);
      expect(request.request.body.deliveryFee).toBe(0);
      request.flush({ ...request.request.body, id: 201 });
      await settle();
    });
  });
});
