export function normalizeCollection(data) {
  if (Array.isArray(data)) {
    return {
      content: data,
      totalPages: 1,
      totalElements: data.length,
    };
  }

  return {
    content: data?.content || [],
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || data?.content?.length || 0,
  };
}
