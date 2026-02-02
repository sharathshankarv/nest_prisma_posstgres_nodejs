type sortOrder = 'asc' | 'desc';

export type { sortOrder };

export type AuthError =
  | 'USER_NOT_FOUND'
  | 'INVALID_PASSWORD'
  | 'MISSING_IDENTIFIER'
  | 'MISSING_CREDENTIALS'
  | null;

export type commonErrorType = { code: AuthError; message: string };

export type serviceOpSuccess<T> = {
  success: true;
  message: string;
  data?: T;
};

export type serviceOpFailure<E> = {
  success: false;
  error: E;
};

export type serviceOpResult<T, E> = serviceOpSuccess<T> | serviceOpFailure<E>;
