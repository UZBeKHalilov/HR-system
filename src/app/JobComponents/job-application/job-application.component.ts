import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { JobApplicationService, JobApplication } from '../../Services/job-application.service';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { saveAs } from 'file-saver';

@Component({
  standalone: true,
  selector: 'app-job-application',
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatIconModule,
    FormsModule,
  ],
  templateUrl: './job-application.component.html',
  styleUrls: ['./job-application.component.css'],
})
export class JobApplicationComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<JobApplication>([]);
  paginatedData: JobApplication[] = [];
  private originalData: JobApplication[] = [];
  selectedApplication: JobApplication | null = null;
  isLoading = false;
  errorMessage = '';
  selectedStatus = '';
  statuses: string[] = ['Pending', 'Viewed', 'Approved', 'Rejected'];
  pageSize = 5;
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private jobApplicationService: JobApplicationService) {}

  ngOnInit() {
    this.loadApplications();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.updatePaginatedData();
  }

  loadApplications() {
    this.isLoading = true;
    this.errorMessage = '';
    this.jobApplicationService.getApplications().subscribe({
      next: (data) => {
        this.originalData = data || [];
        this.dataSource.data = [...this.originalData];
        this.updatePaginatedData();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error loading data: ' + (err.message || 'Unknown error');
        this.isLoading = false;
      },
    });
  }

  applySearchAndFilter() {
    let filteredData = [...this.originalData];
    const searchValue = (document.querySelector('.search-input') as HTMLInputElement)?.value.trim().toLowerCase() || '';
    if (searchValue) {
      filteredData = filteredData.filter(
        (application) =>
          `${application.firstName || ''} ${application.lastName || ''}`.toLowerCase().includes(searchValue) ||
          application.email?.toLowerCase().includes(searchValue)
      );
    }
    if (this.selectedStatus) {
      filteredData = filteredData.filter((data) => data.status === this.selectedStatus);
    }
    this.dataSource.data = filteredData;
    this.pageIndex = 0;
    this.updatePaginatedData();
  }

  applySearch(event: Event) {
    this.applySearchAndFilter();
  }

  applyFilter() {
    this.applySearchAndFilter();
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


  getFullName(application: JobApplication): string {
    return `${application.firstName || ''} ${application.lastName || ''}`.trim() || 'N/A';
  }

  viewDetails(application: JobApplication) {
    this.selectedApplication = { ...application };
    if (application.status === 'Pending') {
      this.changeStatus(application.id, 'Viewed');
    }
  }

  changeStatus(id: number, status: string) {
    this.jobApplicationService.changeStatus(id, status).subscribe({
      next: () => {
        const appInTable = this.dataSource.data.find((a) => a.id === id);
        if (appInTable) {
          appInTable.status = status;
          this.dataSource.data = [...this.dataSource.data];
          this.updatePaginatedData();
        }
        if (this.selectedApplication && this.selectedApplication.id === id) {
          this.selectedApplication.status = status;
          if (status === 'Approved') {
            console.log(`Email will be sent to ${this.selectedApplication?.email} by backend`);
          }
        }
        this.closeDetails();
      },
      error: (err) => {
        console.error('Error changing status:', err);
        this.errorMessage = `Error updating status: ${err.status} - ${err.statusText || 'Unknown error'}`;
      },
    });
  }

  deleteApplication(id: number) {
    this.jobApplicationService.deleteApplication(id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter((a) => a.id !== id);
        this.updatePaginatedData();
        if (this.selectedApplication?.id === id) this.selectedApplication = null;
      },
      error: (err) => {
        console.error('Error deleting application:', err);
        this.errorMessage = 'Error deleting application: ' + (err.message || 'Unknown error');
      },
    });
  }

  downloadFile(filePath: string, fileName: string) {
    this.jobApplicationService.downloadFile(filePath).subscribe({
      next: (blob) => {
        saveAs(blob, fileName);
      },
      error: (err) => {
        console.error('Error downloading file:', err);
        this.errorMessage = 'Error downloading file: ' + (err.message || 'Unknown error');
      },
    });
  }

  closeDetails() {
    this.selectedApplication = null;
  }
}