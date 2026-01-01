"use client";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";

export const useGetStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        const res = await apiGet("/api/students");
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
  });
};

// export const useCreateStudent = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: async (data: any) => {
//       const res = await axios.post("/api/students", data);
//       return res.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["users"] });
//     },
//     onError: (error: any) => {
//       console.error("Error creating student:", error);
//       throw new Error(error?.response?.data?.message || "Failed to create student");
//     },
//   });
// };
