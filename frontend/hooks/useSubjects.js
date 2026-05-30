// hooks/useSubjects.js
import { useState, useEffect } from "react";
import apiFetch from "../utils/apiFetch";

export default function useSubjects() {
  const [subjectsList, setSubjectsList] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjectsError, setSubjectsError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const resBody = await apiFetch("subjects", { softFail: true });
        setSubjectsList(resBody?.data || []);
      } catch (error) {
        console.error("Error fetching available subjects:", error);
        setSubjectsError(error.message || "Failed to load subjects");
        setSubjectsList([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  return { subjectsList, loadingSubjects, subjectsError };
}