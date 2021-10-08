import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let divisor = 1;
    let unitIndex = 0;
    let nextDivisor = divisor * 1024;
    while (Math.floor(value / nextDivisor) > 0 && unitIndex < units.length - 1) {
      unitIndex++;
      divisor = nextDivisor;
      nextDivisor = divisor * 1024;
    }
    const extension = units[unitIndex];

    return (value / divisor).toFixed(2) + ' ' + extension;
  }

}
