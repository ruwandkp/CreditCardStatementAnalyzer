import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  template: `
    <div class="nav-container">
      <div class="logo">
        <h1>CCSA</h1>
      </div>
      <nav class="nav-menu">
        <ul>
          <li [class.active]="isActive('/dashboard')">
            <a routerLink="/dashboard">
              <span class="material-icons">dashboard</span>
              <span>Dashboard</span>
            </a>
          </li>
          <li [class.active]="isActive('/statements')">
            <a routerLink="/statements">
              <span class="material-icons">description</span>
              <span>Statements</span>
            </a>
          </li>
          <li [class.active]="isActive('/analytics')">
            <a routerLink="/analytics">
              <span class="material-icons">insights</span>
              <span>Analytics</span>
            </a>
          </li>
          <li [class.active]="isActive('/upload')">
            <a routerLink="/upload">
              <span class="material-icons">cloud_upload</span>
              <span>Upload</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  `,
  styles: [`
    .nav-container {
      width: 250px;
      height: 100%;
      background-color: #3f51b5;
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    }
    
    .logo {
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .logo h1 {
      margin: 0;
      font-size: 24px;
    }
    
    .nav-menu {
      flex: 1;
    }
    
    .nav-menu ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .nav-menu li {
      margin: 0;
      padding: 0;
    }
    
    .nav-menu li a {
      display: flex;
      align-items: center;
      color: white;
      text-decoration: none;
      padding: 15px 20px;
      transition: background-color 0.3s ease;
    }
    
    .nav-menu li a:hover, .nav-menu li.active a {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .nav-menu li a .material-icons {
      margin-right: 10px;
    }
    
    @media (max-width: 768px) {
      .nav-container {
        width: 60px;
      }
      
      .logo h1 {
        font-size: 18px;
      }
      
      .nav-menu li a span:not(.material-icons) {
        display: none;
      }
      
      .nav-menu li a .material-icons {
        margin-right: 0;
      }
    }
  `]
})
export class NavigationComponent {
  constructor(private router: Router) {}
  
  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
} 