import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  NgxScannerQrcodeComponent,
  ScannerQRCodeResult,
  NgxScannerQrcodeService,
  ScannerQRCodeConfig
} from 'ngx-scanner-qrcode';

import { AttendanceService } from '../Services/attendance.service';
import { Router, NavigationStart, Event as RouterEvent } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgxScannerQrcodeComponent
  ]
})

export class AttendanceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scanner') scanner!: NgxScannerQrcodeComponent;
  employeeId: number | null = null;
  scanActive = true;
  scanComplete = false;
  scanMessage = '';
  scanError = '';
  
  currentDateTime: string = '';
  private dateTimeInterval: any = null;

  private routerSubscription: Subscription | null = null;
  
  // Define scanner configuration
  public config: ScannerQRCodeConfig = {
    fps: 30,
    vibrate: 300,
    isBeep: true,
    decode: 'QR-Code',
    constraints: {
      audio: false,
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'environment' // Use the back camera if available
      }
    }
  };

  constructor(
    private attendanceService: AttendanceService,
    private qrCodeService: NgxScannerQrcodeService,
    private router: Router
  ) {
    // Listen for router navigation events to stop scanner when leaving the page
    this.routerSubscription = this.router.events
      .pipe(filter((event: RouterEvent): event is NavigationStart => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        // If navigating away from attendance page
        if (!event.url.includes('/attendance')) {
          this.stopScanner();
        }
      });
  }

  ngOnInit(): void {
    // Check if camera access is available
    if (navigator.mediaDevices) {
      console.log('Camera API is supported');
    } else {
      this.scanError = 'Camera API is not supported in this browser';
    }

    this.updateDateTime();
  
    // Update the date/time every second
    this.dateTimeInterval = setInterval(() => {
      this.updateDateTime();
    }, 1000);
  }

  ngAfterViewInit(): void {
    // Start the scanner automatically after view initialization
    console.log('Component view initialized, starting scanner...');
    this.startScanner();
  }

  ngOnDestroy(): void {
    // Clean up resources when component is destroyed
    console.log('Component destroyed, stopping scanner...');
    this.stopScanner();
    
    // Unsubscribe from router events
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
      this.routerSubscription = null;
    }
  }

  startScanner(): void {
    if (!this.scanner) {
      console.error('Scanner component not initialized');
      this.scanError = 'Scanner component not initialized';
      return;
    }

    // Request camera permissions explicitly
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        console.log('Camera permission granted');
        
        // Start the scanner with a slight delay to ensure DOM is ready
        setTimeout(() => {
          this.scanner.start();
          console.log('Scanner started');
          this.scanActive = true;
        }, 500);
      })
      .catch(error => {
        console.error('Camera permission denied or error:', error);
        this.scanError = 'Camera access denied. Please allow camera access and reload the page.';
      });
  }

  stopScanner(): void {
    // Stop the scanner if it exists
    if (this.scanner) {
      try {
        this.scanner.stop();
        console.log('Scanner stopped');
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
  }

  onScanSuccess(result: ScannerQRCodeResult[]): void {
    console.log('Scan result:', result);
    
    if (result && result.length > 0 && this.scanActive) {
      this.scanActive = false;
      
      try {
        // Assuming QR code contains just the employee ID as a number
        const scannedValue = result[0].value;
        console.log('Scanned value:', scannedValue);
        
        const parsedId = parseInt(scannedValue, 10);
        
        if (isNaN(parsedId)) {
          this.handleScanError('Invalid QR code format. Expected employee ID number.');
          return;
        }
        
        this.employeeId = parsedId;
        this.scanComplete = true;
        this.scanMessage = `Employee ID ${this.employeeId} scanned successfully`;
        
        // Pause the scanner after successful scan
        this.scanner.pause();
      } catch (error) {
        console.error('Error processing QR code:', error);
        this.handleScanError('Error processing QR code');
      }
    }
  }

  handleScanError(message: string): void {
    this.scanError = message;
    this.scanActive = true;
    setTimeout(() => {
      this.scanError = '';
    }, 3000);
  }

  resetScanner(): void {
    this.employeeId = null;
    this.scanComplete = false;
    this.scanMessage = '';
    this.scanError = '';
    this.scanActive = true;
    
    // Restart the scanner
    setTimeout(() => {
      this.scanner.play();
    }, 100);
  }

  recordEntry(): void {
    if (!this.employeeId) return;
    
    this.attendanceService.postAttendanceEntry(this.employeeId)
      .subscribe({
        next: () => {
          this.scanMessage = `Entry recorded for Employee ID: ${this.employeeId}`;
          setTimeout(() => this.resetScanner(), 2000);
        },
        error: (error) => {
          console.error('Error recording entry:', error);
          this.scanError = `Error recording entry: ${error.message || 'Unknown error'}`;
        }
      });
  }

  recordExit(): void {
    if (!this.employeeId) return;
    
    this.attendanceService.postAttendanceExit(this.employeeId)
      .subscribe({
        next: () => {
          this.scanMessage = `Exit recorded for Employee ID: ${this.employeeId}`;
          setTimeout(() => this.resetScanner(), 2000);
        },
        error: (error) => {
          console.error('Error recording exit:', error);
          this.scanError = `Error recording exit: ${error.message || 'Unknown error'}`;
        }
      });
  }


  
  private updateDateTime(): void {
    const now = new Date();
    this.currentDateTime = now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }
}