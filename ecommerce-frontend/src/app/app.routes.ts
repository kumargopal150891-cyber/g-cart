import { Routes } from '@angular/router';
import { adminGuard } from './admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'shop',
    pathMatch: 'full',
  },
  {
    path: 'shop',
    // Lazy load the shop component
    loadComponent: () =>
      import('./shop/shop.component').then((m) => m.ShopComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard], // Protect this route
    // Lazy load the admin component
    loadComponent: () =>
      import('./admin/admin.component').then((m) => m.AdminComponent),
    children: [
      { path: '', redirectTo: 'product', pathMatch: 'full' },
      {
        path: 'product',
        loadComponent: () =>
          import('./admin/product/product.component').then(
            (m) => m.ProductComponent,
          ),
      },
      {
        path: 'category',
        loadComponent: () =>
          import('./admin/category/category.component').then(
            (m) => m.CategoryComponent,
          ),
      },
      {
        path: 'filters',
        loadComponent: () =>
          import('./admin/filters/filters.component').then(
            (m) => m.FiltersComponent,
          ),
      },
      {
        path: 'offers',
        loadComponent: () =>
          import('./admin/offers/offers.component').then(
            (m) => m.OffersComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/users/users.component').then((m) => m.UsersComponent),
      },
    ],
  },
];
