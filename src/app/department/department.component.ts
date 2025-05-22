import { Component, OnInit, ViewChild } from '@angular/core';
import { DepartmentService } from '../Services/department.service';
import { Department } from '../models/department.model';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule
  ],
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {
  departments: Department[] = [];
  newDepartment: string = '';
  selectedDepartment: Department = { departmentId: 0, departmentName: '' };
  dataSource = new MatTableDataSource<Department>();
  displayedColumns: string[] = ['departmentName', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private departmentService: DepartmentService) {}

  ngOnInit() {
    this.loadDepartments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadDepartments() {
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => {
        console.log('Fetched departments:', data);
        this.departments = data;
        this.dataSource.data = data || [];
      },
      error: (err) => {
        console.error('Xatolik yuz berdi:', err);
        this.dataSource.data = [];
      }
    });
  }

  createDepartment() {
    if (!this.newDepartment.trim()) return;

    const department: Department = {
      departmentId: 0,
      departmentName: this.newDepartment
    };

    this.departmentService.createDepartment(department).subscribe({
      next: (response) => {
        console.log('Department created:', response);
        this.newDepartment = '';
        this.loadDepartments();
      },
      error: (err) => console.error('Yaratishda xatolik:', err)
    });
  }

  editDepartment(department: Department) {
    console.log('Tahrirlanayotgan bo‘lim:', department);
    this.selectedDepartment = { ...department };
    console.log('selectedDepartment o‘rnatildi:', this.selectedDepartment);
  }

  updateDepartment() {
    if (this.selectedDepartment.departmentId === 0) {
      console.log('Tahrirlash uchun bo‘lim tanlanmagan');
      return;
    }

    console.log('Yangilanayotgan bo‘lim:', this.selectedDepartment);
    this.departmentService.updateDepartment(
      this.selectedDepartment.departmentId,
      this.selectedDepartment
    ).subscribe({
      next: (response) => {
        console.log('Bo‘lim yangilandi:', response);
        this.selectedDepartment = { departmentId: 0, departmentName: '' };
        this.loadDepartments();
      },
      error: (err) => {
        console.error('Yangilashda xatolik:', err);
      }
    });
  
  }
  
  deleteDepartment(id: number) {
    if (confirm('Bu bo‘limni o‘chirishni xohlaysizmi?')) {
      this.departmentService.deleteDepartment(id).subscribe({
        next: (response) => {
          console.log('Bo‘lim o‘chirildi:', response);
          this.departments = this.departments.filter(dept => dept.departmentId !== id);
          this.dataSource.data = this.departments;
        },
        error: (err) => {
          console.error('O‘chirishda xatolik:', err);
          alert('Xatolik yuz berdi: ' + err.message); // Foydalanuvchiga xabar
        }
      });
    }
  }

  cancelEdit() {
    this.selectedDepartment = { departmentId: 0, departmentName: '' };
  }

  isEditing(departmentId: number): boolean {
    const isEditing = this.selectedDepartment.departmentId === departmentId;
    console.log(`isEditing(${departmentId}):`, isEditing);
    return isEditing;
  }
}

function alert(arg0: string) {
  throw new Error('Function not implemented.');
}
