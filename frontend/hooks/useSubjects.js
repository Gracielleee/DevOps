// hooks/useSubjects.js
import { useState, useEffect } from "react";

export default function useSubjects() {
  const [subjectsList, setSubjectsList] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjectsError, setSubjectsError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const SUBJECTS_ENDPOINT = `${API_BASE_URL}subjects`;

      try {
        setLoadingSubjects(true);
        const response = await fetch(SUBJECTS_ENDPOINT);
        
        if (!response.ok) {
          throw new Error("Failed to fetch subjects");
        }
        
        const resBody = await response.json();
        
        setSubjectsList(resBody.data || []); 
      } catch (error) {
        console.error("Error fetching available subjects:", error);
        setSubjectsError(error.message);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  return { subjectsList, loadingSubjects, subjectsError };
}