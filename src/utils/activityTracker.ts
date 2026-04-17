// Activity tracking utility for the supermarket management system

interface Activity {
  id: string;
  timestamp: number;
  time: string;
  action: string;
  amount: string;
  user: string;
  category: 'employee' | 'product' | 'sale' | 'supplier' | 'customer' | 'system';
}

class ActivityTracker {
  private static instance: ActivityTracker;
  private activities: Activity[] = [];

  private constructor() {
    this.loadActivities();
  }

  static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker();
    }
    return ActivityTracker.instance;
  }

  private loadActivities(): void {
    try {
      const stored = localStorage.getItem('systemActivities');
      if (stored) {
        this.activities = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
      this.activities = [];
    }
  }

  private saveActivities(): void {
    localStorage.setItem('systemActivities', JSON.stringify(this.activities));
  }

  private formatTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} mins ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  }

  private getCurrentUser(): string {
    const userRole = localStorage.getItem('userRole');
    const customerName = localStorage.getItem('customerName');
    const authToken = localStorage.getItem('authToken');
    
    if (customerName) return customerName;
    if (userRole) return userRole.charAt(0).toUpperCase() + userRole.slice(1);
    return 'System';
  }

  addActivity(action: string, amount: string, category: Activity['category']): void {
    const activity: Activity = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      time: this.formatTime(Date.now()),
      action,
      amount,
      user: this.getCurrentUser(),
      category
    };

    this.activities.unshift(activity);
    
    // Keep only last 50 activities
    if (this.activities.length > 50) {
      this.activities = this.activities.slice(0, 50);
    }

    this.saveActivities();
    console.log('🔥 Activity Added:', activity);
  }

  getActivities(): Activity[] {
    return this.activities;
  }

  // Specific activity methods for common actions
  logEmployeeAdded(employeeName: string): void {
    this.addActivity(
      `New employee added: ${employeeName}`,
      employeeName,
      'employee'
    );
  }

  logEmployeeUpdated(employeeName: string): void {
    this.addActivity(
      `Employee updated: ${employeeName}`,
      employeeName,
      'employee'
    );
  }

  logEmployeeDeleted(employeeName: string): void {
    this.addActivity(
      `Employee removed: ${employeeName}`,
      employeeName,
      'employee'
    );
  }

  logProductAdded(productName: string): void {
    this.addActivity(
      `New product added: ${productName}`,
      productName,
      'product'
    );
  }

  logProductUpdated(productName: string): void {
    this.addActivity(
      `Product updated: ${productName}`,
      productName,
      'product'
    );
  }

  logProductDeleted(productName: string): void {
    this.addActivity(
      `Product removed: ${productName}`,
      productName,
      'product'
    );
  }

  logSaleCompleted(saleAmount: string, itemCount: number): void {
    this.addActivity(
      `Sale completed: ${itemCount} items`,
      saleAmount,
      'sale'
    );
  }

  logSupplierAdded(supplierName: string): void {
    this.addActivity(
      `New supplier added: ${supplierName}`,
      supplierName,
      'supplier'
    );
  }

  logSupplierUpdated(supplierName: string): void {
    this.addActivity(
      `Supplier updated: ${supplierName}`,
      supplierName,
      'supplier'
    );
  }

  logSupplierDeleted(supplierName: string): void {
    this.addActivity(
      `Supplier removed: ${supplierName}`,
      supplierName,
      'supplier'
    );
  }

  logCustomerAdded(customerName: string): void {
    this.addActivity(
      `New customer registered: ${customerName}`,
      customerName,
      'customer'
    );
  }

  logCustomerUpdated(customerName: string): void {
    this.addActivity(
      `Customer updated: ${customerName}`,
      customerName,
      'customer'
    );
  }

  logPurchaseOrderCreated(supplierName: string, orderAmount: string): void {
    this.addActivity(
      `Purchase order created: ${supplierName}`,
      orderAmount,
      'supplier'
    );
  }

  logStockUpdated(productName: string, quantity: number): void {
    this.addActivity(
      `Stock updated: ${productName}`,
      `${quantity} units`,
      'product'
    );
  }

  logSystemMaintenance(action: string): void {
    this.addActivity(
      `System: ${action}`,
      'System',
      'system'
    );
  }

  // Update time labels for all activities
  updateTimeLabels(): void {
    this.activities = this.activities.map(activity => ({
      ...activity,
      time: this.formatTime(activity.timestamp)
    }));
    this.saveActivities();
  }
}

export default ActivityTracker;
