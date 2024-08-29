export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }


  export function getMonthDate(): string {
    const getActualMonth = new Date
    const month = getActualMonth.getMonth();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiemre", "Octubre", "Noviembre", "Diciembre"];
    return monthNames[month]
  }


  export const formatDate = (date: any): any => {
    return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}