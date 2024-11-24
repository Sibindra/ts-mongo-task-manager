export const normalizeQuery = (query: any) => {
  const { page, limit, filter, ...rest } = query;

  // if filter is present then use it else infer from rest
  const normalizedFilter = {
    ...filter,
    ...(rest.status && { status: rest.status }),
    ...(rest.customerId && { customerId: rest.customerId }),
    ...(rest.dateRangeStart && {
      dateRangeStart: new Date(rest.dateRangeStart),
    }),
    ...(rest.dateRangeEnd && { dateRangeEnd: new Date(rest.dateRangeEnd) }),
  };

  return {
    page: page ? Number.parseInt(page, 10) : undefined,
    limit: limit ? Number.parseInt(limit, 10) : undefined,
    filter: Object.keys(normalizedFilter).length > 0 ? normalizedFilter : undefined,
  };
};
