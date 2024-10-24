function isStandardUser(userRole: string): boolean {
  return userRole === 'User';
}

export default isStandardUser;