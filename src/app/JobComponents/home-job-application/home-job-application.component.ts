import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobApplicationService } from '../../Services/job-application.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-job-application',
  standalone : true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './home-job-application.component.html',
  styleUrl: './home-job-application.component.css'
})
export class HomeJobApplicationComponent {
  applicationForm: FormGroup;
  files: any[] = [];
  isSubmitting = false;
  responseMessage: string = '';
  isSuccess: boolean = false;
  
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private jobApplicationService: JobApplicationService
  ) {
    this.applicationForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      route: ['', [Validators.required]]
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as any;
    if (input.files && this.files.length < 5) {
      const newFiles = Array.from(input.files);
      const remainingSlots = 5 - this.files.length;
      const filesToAdd = newFiles.slice(0, remainingSlots);
      this.files.push(...filesToAdd);
    }
    
    if (input.files && input.files.length > 5) {
      alert('Faqat 5 tagacha fayl yuklash mumkin!');
    }
    
    this.fileInput.nativeElement.value = '';
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
  }

  onSubmit(): void {
    if (this.applicationForm.invalid || this.files.length === 0) {
      return;
    }

    this.isSubmitting = true;
    this.responseMessage = '';

    // FormData obyektini yaratish
    const formData = new FormData();
    formData.append('firstName', this.applicationForm.get('firstName')?.value);
    formData.append('lastName', this.applicationForm.get('lastName')?.value);
    formData.append('email', this.applicationForm.get('email')?.value);
    formData.append('route', this.applicationForm.get('route')?.value);

    // Fayllarni "jobApplications" nomi bilan qo'shish
    this.files.forEach((file) => {
      formData.append('jobApplications', file, file.name);
    });

    // Service orqali API ga so'rov yuborish
    this.jobApplicationService.submitApplication(formData)
      .subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          this.isSuccess = true;
          this.responseMessage = response.Massage || 'Ariza muvaffaqiyatli yuborildi!';
          this.resetForm();
        },
        error: (error: { error: { Message: any; }; message: any; }) => {
          this.isSubmitting = false;
          this.isSuccess = false;
          this.responseMessage = 'Xatolik yuz berdi: ' + (error.error?.Message || error.message || 'Noma\'lum xatolik');
          console.error('Error:', error);
        }
      });
  }

  private resetForm(): void {
    this.applicationForm.reset();
    this.files = [];
  }
}

function alert(arg0: string) {
  throw new Error('Function not implemented.');
}
