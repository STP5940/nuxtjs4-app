/**
 * สร้างจำนวนเต็มแบบสุ่มในช่วงที่กำหนด
 * @param min ค่าต่ำสุด (รวม)
 * @param max ค่าสูงสุด (รวม)
 * @return จำนวนเต็มแบบสุ่มในช่วงที่กำหนด
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * เลือกค่าหนึ่งแบบสุ่มจากอาเรย์
 * @param array อาเรย์ที่ต้องการเลือกค่า
 * @return ค่าที่ถูกเลือกแบบสุ่ม
 */
export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}
