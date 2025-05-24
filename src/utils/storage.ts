/**
 * 将数据保存到 localStorage
 * @param key 存储键名
 * @param data 要存储的数据
 */
export const setData = <T>(key: string, data: T): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
};

/**
 * 从 localStorage 读取数据
 * @param key 存储键名
 * @returns 存储的数据，如果不存在则返回 null
 */
export const getData = <T>(key: string): T | null => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return null;
    }
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error('Error reading data from localStorage:', error);
    return null;
  }
}; 