import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { EmployeeService } from '../Services/employee.service';
import { Employee } from '../models/employee.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatPaginatorModule,
    MatSnackBarModule,
  ],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeComponent implements OnInit, AfterViewInit {
  private router = inject(Router);
  employees: Employee[] = [];
  dataSource = new MatTableDataSource<Employee>([]);
  paginatedData: Employee[] = [];
  roles: string[] = ['All', 'Admin', 'Employee', 'Manager'];
  selectedRole: string = 'All';
  errorMessage: string | null = null;
  showModal: boolean = false;
  pageSize = 5;
  pageIndex = 0;

  newEmployee: any = {
    userName: '',
    password: '',
    role: 'Employee',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    hireDate: '',
    position: '',
    city: '',
    jobTitle: '',
    departmentId: 0,
  };

  cities: string[] = ['Tashkent', 'Samarkand', 'Bukhara', 'Andijan', 'Fergana', 'Namangan', 'Qarshi', 'Nukus'];
  departments: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private employeeService: EmployeeService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadEmployees();
    this.loadDepartments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.updatePaginatedData();
  }

  loadEmployees() {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.dataSource.data = employees;
        this.applyFilter();
        this.updatePaginatedData();
        this.errorMessage = null;
        if (employees.length === 0) {
          this.snackBar.open('No employees found.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
        }
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.snackBar.open(this.errorMessage ?? 'An error occurred.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  loadDepartments() {
    this.employeeService.getDepartments().subscribe({
      next: (depts) => (this.departments = depts),
      error: (err) =>
        this.snackBar.open('Failed to load departments.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        }),
    });
  }

  applyFilter() {
    let filteredData = this.employees;
    if (this.selectedRole !== 'All') {
      filteredData = this.employees.filter((emp) => emp.role === this.selectedRole);
    }
    this.dataSource.data = filteredData;
    this.updatePaginatedData();
  }

  applySearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.data = this.employees.filter(
      (employee) =>
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(filterValue) ||
        employee.email?.toLowerCase().includes(filterValue)
    );
    this.updatePaginatedData();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  updatePaginatedData() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.dataSource.data.slice(startIndex, endIndex);
  }

  getFullName(employee: Employee): string {
    return `${employee.firstName} ${employee.lastName}`;
  }

  viewEmployee(employeeId: number) {
    this.router.navigate(['/employee-info', employeeId]);
  }

  openAddEmployeeModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetNewEmployee();
  }

  addEmployee() {
    this.employeeService.registerEmployee(this.newEmployee).subscribe({
      next: () => {
        this.snackBar.open('Employee added successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
        this.closeModal();
        this.loadEmployees();
      },
      error: (err) =>
        this.snackBar.open(err.message || 'Failed to add employee.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        }),
    });
  }

  resetNewEmployee() {
    this.newEmployee = {
      userName: '',
      password: '',
      role: 'Employee',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      hireDate: '',
      position: '',
      city: '',
      jobTitle: '',
      departmentId: 0,
    };
  }
}