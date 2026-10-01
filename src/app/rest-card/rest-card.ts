import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-rest-card',
  imports: [],
  templateUrl: './rest-card.html',
  styleUrl: './rest-card.scss',
})
export class RestCard {

  restaurants = signal([
    {
      id: 1,
      name: 'Pizza Garden',
      description: 'Fresh Italian pizza with homemade tomato sauce.',
      cuisine: 'italian',
      imageUrl: 'https://media.istockphoto.com/id/457826001/vector/african-american-happy-chef-holding-a-pizza-with-background.jpg?s=612x612&w=0&k=20&c=NnZdPgqSNhoXsbo1tFp44ssugbM41FUradgJHfrWIvw=',
      rating: 4.7,
      deliveryTimeMin: 25,
      deliveryTimeMax: 35,
      deliveryFee: 5.99,
      minimumOrderValue: 25,
      isActive: true
    },

    {
      id: 2,
      name: 'Pierogi Corner',
      description: 'Traditional Polish pierogi with different fillings.',
      cuisine: 'polish',
      imageUrl: 'https://its-poland.com/files/services_photos/d28816d116eba3f41bdbdc9f197e5df1.jpg',
      rating: 4.9,
      deliveryTimeMin: 20,
      deliveryTimeMax: 30,
      deliveryFee: 3.99,
      minimumOrderValue: 20,
      isActive: true
    },

    {
      id: 3,
      name: 'Wok Express',
      description: 'Quick and tasty Chinese dishes prepared to order.',
      cuisine: 'chinese',
      imageUrl: 'https://i.pinimg.com/474x/5d/d0/6c/5dd06c5ed0f1f7c1d082afb0ca4272df.jpg',
      rating: 4.5,
      deliveryTimeMin: 30,
      deliveryTimeMax: 40,
      deliveryFee: 6.99,
      minimumOrderValue: 25,
      isActive: false
    }
  ]);

}