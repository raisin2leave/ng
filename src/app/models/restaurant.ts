export enum CuisineType {
  Italian = 'italian',
  Polish = 'polish',
  Chinese = 'chinese',
  Thai = 'thai',
  American = 'american',
}

export type Restaurant = {
  id: number;
  name: string;
  description: string;
  cuisine: CuisineType;
  imageUrl?: string;
  rating: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFee: number;
  minimumOrderValue: number;
  isActive: boolean;
};
