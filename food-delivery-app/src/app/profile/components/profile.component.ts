import { Component, OnInit } from '@angular/core';

type UserProfile = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
  avatarUrl: string;
  isActive: boolean;
};

type Stats = {
  totalOrders: number;
  favoriteRestaurants: number;
  savedAddresses: number;
  rewardPoints: number;
};

type ActivityItem = {
  type: 'Order' | 'Favorite' | 'Address' | 'Reward';
  title: string;
  when: string;
};

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  saving = false;

  user: UserProfile = {
    fullName: 'Thanh Nguyen Do',
    username: 'richarddo',
    email: 'thanh@example.com',
    phone: '(817) 000-0000',
    city: 'Fort Worth, TX',
    bio: 'Building Foodeli — cloud-native food delivery with a neon UI ✨',
    avatarUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=60',
    isActive: true
  };

  // Form draft (editable)
  draft: UserProfile = { ...this.user };

  stats: Stats = {
    totalOrders: 24,
    favoriteRestaurants: 7,
    savedAddresses: 3,
    rewardPoints: 1250
  };

  recentActivity: ActivityItem[] = [
    { type: 'Order', title: 'Ordered from Spice Fusion', when: '2 days ago' },
    { type: 'Favorite', title: 'Saved “Seafood Paradise”', when: '1 week ago' },
    { type: 'Address', title: 'Added “Campus Dorm” address', when: '2 weeks ago' },
    { type: 'Reward', title: 'Earned +120 points', when: '3 weeks ago' }
  ];

  ngOnInit(): void {}

  onEditProfile(): void {
    // Optional: scroll to form or toggle edit mode
    window.scrollTo({ top: 220, behavior: 'smooth' });
  }

  onChangePassword(): void {
    // Wire to your route/modal later
    alert('Change Password clicked (wire me to your auth flow)');
  }

  onSave(): void {
    this.saving = true;

    // Simulate API call
    setTimeout(() => {
      this.user = { ...this.draft };
      this.saving = false;
    }, 900);
  }

  onReset(): void {
    this.draft = { ...this.user };
  }
}
