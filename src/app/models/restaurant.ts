export enum CuisineType {
  Italian = 'italian',
  Polish = 'polish',
  Chinese = 'chinese',
  Thai = 'thai',
  American = 'american',
}

export const cuisineOptions = [
  { value: CuisineType.American, label: 'Amerykańska' },
  { value: CuisineType.Italian, label: 'Włoska' },
  { value: CuisineType.Chinese, label: 'Chińska' },
  { value: CuisineType.Thai, label: 'Tajska' },
  { value: CuisineType.Polish, label: 'Polska' },
];

export type Restaurant = {
  id: number;
  name: string;
  description: string;
  address: string;
  cuisine: CuisineType;
  imageUrl?: string;
  rating: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFee: number;
  minimumOrderValue: number;
  isActive: boolean;
};

export type RestaurantFormValue = {
  name: string;
  description: string;
  address: string;
  cuisine: CuisineType;
  imageUrl: string;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFee: number;
  minimumOrderValue: number;
  isActive: boolean;
};
