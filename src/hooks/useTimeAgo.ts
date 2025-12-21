import { useState, useEffect } from 'react';

/**
 * Hook để hiển thị thời gian real-time (tự động cập nhật)
 * @param dateString - ISO date string từ API
 * @returns String hiển thị thời gian (ví dụ: "5 phút trước")
 */
export const useTimeAgo = (dateString: string | null | undefined): string => {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!dateString) {
      setTimeAgo('');
      return;
    }

    const formatTimeAgo = (date: Date): string => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return 'Vừa xong';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} phút trước`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} giờ trước`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ngày trước`;
      } else {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} tuần trước`;
      }
    };

    const updateTime = () => {
      try {
        const postDate = new Date(dateString);
        if (isNaN(postDate.getTime())) {
          setTimeAgo('');
          return;
        }
        setTimeAgo(formatTimeAgo(postDate));
      } catch (error) {
        setTimeAgo('');
      }
    };

    // Cập nhật ngay lập tức
    updateTime();

    // Cập nhật mỗi 30 giây để real-time
    const interval = setInterval(updateTime, 30000);

    return () => clearInterval(interval);
  }, [dateString]);

  return timeAgo;
};

