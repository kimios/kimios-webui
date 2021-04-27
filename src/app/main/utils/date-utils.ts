export class DateUtils {
    public static dateAndTimeShort_FR(date: Date): string {
        return date.getDate()
            + '/' + (date.getMonth() + 1)
            + '/' + date.getFullYear()
            + ', ' + this.addLeadingZeros(date.getHours(), 2) + ':'
            + this.addLeadingZeros(date.getMinutes(), 2);
    }

    public static addLeadingZeros(n: number, length: number): string {
        let str = n.toString();
        let nbZeros = length - str.length;
        while (nbZeros > 0) {
            str = '0' + str;
            nbZeros--;
        }
        return str;
    }
}
