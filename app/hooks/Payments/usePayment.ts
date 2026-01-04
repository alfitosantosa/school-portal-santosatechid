"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api-client";

export const useGetPayments = () => {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      try {
        const res = await apiGet("/api/payment");
        return res.data;
      } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch payments");
      }
    },
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiPost("/api/payment", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiPut("/api/payment", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiDelete("/api/payment", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
};

export const useGetPaymentById = (id: string) => {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: async () => {
      try {
        const res = await apiGet(`/api/payment/${id}`);
        return res.data;
      } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to fetch payment");
      }
    },
  });
};

// export const useGetPaymentByStudentId = (studentId: string) => {
//   return useQuery({
//     queryKey: ["payment", "student", studentId],
//     queryFn: async () => {
//       try {
//         const res = await apiGet(`/api/payment?studentId=${studentId}`);
//         return res.data;
//       } catch (error: any) {
//         throw new Error(error?.response?.data?.message || "Failed to fetch payment");
//       }
//     },
//   });
// };
