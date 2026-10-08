// All cuisine types that exist in our data.
// CuisineType.Italian is simply the text 'italian'.
export enum CuisineType {
  Italian = 'italian',
  Polish = 'polish',
  Chinese = 'chinese',
  Thai = 'thai',
  American = 'american',
}

// The shape of one restaurant object (required by Lab 1).
// The ? after imageUrl means this field is optional.
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
