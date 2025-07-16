import type { FoodItem, MealEntry, User } from '../types/index.js';

let API_BASE_URL = 'http://192.168.102.6:5000/api';

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

interface SignupResponse {
  message: string;
  token: string;
  user: User;
}

interface ApiError {
  error: string;
}

class ApiService {
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is ok first
      if (!response.ok) {
        console.error('HTTP error:', response.status, response.statusText);

        // Try to get error message from response
        try {
          const errorText = await response.text();
          console.error('Error response body:', errorText);
          throw new Error(`Login failed: ${response.status} ${response.statusText}`);
        } catch {
          throw new Error(`Login failed: ${response.status} ${response.statusText}`);
        }
      }

      // Try to parse JSON response
      let data;
      try {
        const responseText = await response.text();
        console.log('Response body:', responseText);

        if (!responseText.trim()) {
          throw new Error('Empty response from server');
        }

        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Invalid response format from server');
      }

      return data as LoginResponse;
    } catch (error) {
      console.error('Login error:', error);

      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed. Please try again.');
    }
  }

  async signup(name: string, email: string, password: string): Promise<SignupResponse> {
    try {
      console.log('Attempting signup to:', `${API_BASE_URL}/auth/signup`);

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ name, email, password }),
      });

      console.log('Response status:', response.status);

      // Check if response is ok first
      if (!response.ok) {
        console.error('HTTP error:', response.status, response.statusText);

        // Try to get error message from response
        try {
          const errorText = await response.text();
          console.error('Error response body:', errorText);
          throw new Error(`Signup failed: ${response.status} ${response.statusText}`);
        } catch {
          throw new Error(`Signup failed: ${response.status} ${response.statusText}`);
        }
      }

      // Try to parse JSON response
      let data;
      try {
        const responseText = await response.text();
        console.log('Response body:', responseText);

        if (!responseText.trim()) {
          throw new Error('Empty response from server');
        }

        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Invalid response format from server');
      }

      return data as SignupResponse;
    } catch (error) {
      console.error('Signup error:', error);

      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Signup failed. Please try again.');
    }
  }

  async getFoodItems(token: string): Promise<FoodItem[]> {
    try {
      console.log('Fetching food items from:', `${API_BASE_URL}/food-items`);

      const response = await fetch(`${API_BASE_URL}/food-items`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      console.log('Food items response status:', response.status);

      if (!response.ok) {
        console.error('HTTP error:', response.status, response.statusText);
        throw new Error(`Failed to fetch food items: ${response.status}`);
      }

      let data;
      try {
        const responseText = await response.text();
        console.log('Food items response body:', responseText);

        if (!responseText.trim()) {
          throw new Error('Empty response from server');
        }

        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Invalid response format from server');
      }

      return data as FoodItem[];
    } catch (error) {
      console.error('Get food items error:', error);

      // Return mock food items as fallback
      return [
        {
          id: '1',
          name: 'Apple',
          calories: 95,
          protein: 0.5,
          carbs: 25,
          fat: 0.3,
          serving: '1 medium (182g)'
        },
        {
          id: '2',
          name: 'Banana',
          calories: 105,
          protein: 1.3,
          carbs: 27,
          fat: 0.4,
          serving: '1 medium (118g)'
        },
        {
          id: '3',
          name: 'Chicken Breast',
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          serving: '100g'
        },
        {
          id: '4',
          name: 'Brown Rice',
          calories: 216,
          protein: 5,
          carbs: 45,
          fat: 1.8,
          serving: '1 cup cooked (195g)'
        },
        {
          id: '5',
          name: 'Broccoli',
          calories: 55,
          protein: 3.7,
          carbs: 11,
          fat: 0.6,
          serving: '1 cup chopped (91g)'
        }
      ];
    }
  }

  async updateMealEntry(token: string, entryId: string, updatedEntry: Partial<MealEntry>): Promise<void> {
    try {
      console.log('Updating meal entry:', entryId, updatedEntry);

      const response = await fetch(`${API_BASE_URL}/meals/${entryId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(updatedEntry),
      });

      console.log('Update meal entry response status:', response.status);

      if (!response.ok) {
        console.error('HTTP error:', response.status, response.statusText);
        throw new Error(`Failed to update meal entry: ${response.status}`);
      }
    } catch (error) {
      console.error('Update meal entry error:', error);
      throw error;
    }
  }

  async deleteMealEntry(token: string, entryId: string): Promise<void> {
    try {
      console.log('Deleting meal entry:', entryId);

      const response = await fetch(`${API_BASE_URL}/meals/${entryId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(token),
      });

      console.log('Delete meal entry response status:', response.status);

      if (!response.ok) {
        console.error('HTTP error:', response.status, response.statusText);
        throw new Error(`Failed to delete meal entry: ${response.status}`);
      }
    } catch (error) {
      console.error('Delete meal entry error:', error);
      throw error;
    }
  }

  async getProfile(token: string): Promise<{ user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error((data as ApiError).error || 'Failed to fetch profile');
    }

    return data;
  }

  async updateProfile(token: string, profile: Partial<User>): Promise<{ message: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(profile),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error((data as ApiError).error || 'Failed to update profile');
    }

    return data;
  }

  async getFoods(token: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/foods`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error((data as ApiError).error || 'Failed to fetch foods');
    }

    return data;
  }

  async getMeals(token: string, date: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/meals?date=${date}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error((data as ApiError).error || 'Failed to fetch meals');
    }

    return data;
  }

  async addMealEntry(token: string, mealEntry: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/meals`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(mealEntry),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error((data as ApiError).error || 'Failed to add meal entry');
    }

    return data;
  }

  async getDailySummary(token: string, date: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/summary/${date}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error((data as ApiError).error || 'Failed to fetch daily summary');
    }

    return data;
  }
}

export const apiService = new ApiService();
