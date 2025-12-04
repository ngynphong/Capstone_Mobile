// src/hooks/useTeacherRatings.ts
import { useState, useCallback } from "react";
import TeacherRatingService from "../services/teacherRatingService";
import type {
  TeacherRating,
  TeacherRatingPayload,
} from "../types/teacherRating";
import type { ApiResponse } from "../types/apiTypes";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const axiosError = error as {
      response?: { data?: { message?: string; error?: string } };
    };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim() !== "") {
    return error;
  }

  return fallback;
};

export const useTeacherRatings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<TeacherRating[]>([]);
 
  const [myRating, setMyRating] = useState<TeacherRating | null>(null);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const fetchRatingsByTeacher = useCallback(
    async (
      teacherId: string,
      page: number = 0,
      size: number = 10,
      sortBy: string = "createdAt",
      sortDir: string = "DESC"
    ): Promise<TeacherRating[]> => {
      try {
        setLoading(true);
        setError(null);

        const response = await TeacherRatingService.getRatingsByTeacher(
          teacherId,
          page,
          size,
          sortBy,
          sortDir
        );

        // Handle paginated response structure
        const responseData = response.data;

        if (responseData && responseData.data) {
          const paginatedData = responseData.data;
          const ratingsArray = paginatedData.content || [];

          setRatings(ratingsArray);
          setTotalElements(paginatedData.totalElements || 0);
          setTotalPages(paginatedData.totalPages || 0);
          setCurrentPage(paginatedData.pageable?.pageNumber || page);

          return ratingsArray;
        }

        setRatings([]);
        setTotalElements(0);
        setTotalPages(0);
        setCurrentPage(0);
        return [];
      } catch (err) {
        setError(
          getErrorMessage(err, "Không thể tải danh sách đánh giá của giáo viên.")
        );
        setRatings([]);
        setTotalElements(0);
        setTotalPages(0);
        setCurrentPage(0);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchRatingsByStudent = useCallback(
    async (studentId: string): Promise<TeacherRating[]> => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await TeacherRatingService.getRatingsByStudent(studentId);
        const responseData =
          response.data as ApiResponse<TeacherRating[]> | TeacherRating[];

        const rawData =
          Array.isArray(responseData) || !responseData
            ? responseData
            : (responseData as ApiResponse<TeacherRating[]>).data ??
            responseData;

        if (Array.isArray(rawData)) {
          setRatings(rawData);
          return rawData;
        }

        setRatings([]);
        return [];
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Không thể tải danh sách đánh giá mà học sinh đã gửi."
          )
        );
        setRatings([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchRatingByTeacherAndStudent = useCallback(
    async (teacherId: string, studentId: string): Promise<TeacherRating | null> => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await TeacherRatingService.getRatingByTeacherAndStudent(
            teacherId,
            studentId
          );

        const responseData =
          response.data as ApiResponse<TeacherRating> | TeacherRating | null;

        const rawData =
          !responseData || ("rating" in (responseData as TeacherRating))
            ? responseData
            : (responseData as ApiResponse<TeacherRating>).data ?? null;

        if (rawData && typeof rawData === "object") {
          setMyRating(rawData as TeacherRating);
          return rawData as TeacherRating;
        }

        setMyRating(null);
        return null;
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Không thể tải đánh giá của học sinh cho giáo viên này."
          )
        );
        setMyRating(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createRating = useCallback(
    async (payload: TeacherRatingPayload): Promise<TeacherRating | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await TeacherRatingService.createRating(payload);
        const responseData =
          response.data as ApiResponse<TeacherRating> | TeacherRating;

        const rawData =
          responseData && "rating" in (responseData as TeacherRating)
            ? responseData
            : (responseData as ApiResponse<TeacherRating>).data ??
            responseData;

        if (rawData && typeof rawData === "object") {
          const rating = rawData as TeacherRating;
          setMyRating(rating);
          return rating;
        }

        return null;
      } catch (err) {
        setError(
          getErrorMessage(err, "Không thể gửi đánh giá cho giáo viên.")
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    ratings,
    myRating,
    totalElements,
    totalPages,
    currentPage,
    fetchRatingsByTeacher,
    fetchRatingsByStudent,
    fetchRatingByTeacherAndStudent,
    createRating,
  };
};

export default useTeacherRatings;


