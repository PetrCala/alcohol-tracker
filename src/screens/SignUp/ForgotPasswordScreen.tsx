function ForgotPasswordScreen() {
  return <></>;
}

ForgotPasswordScreen.displayName = 'Login Screen';
export default ForgotPasswordScreen;

// const handleResetPassword = async (mail: string) => {
//   try {
//     await sendPasswordResetEmail(auth, mail);
//     dispatch({type: 'SET_SUCCESS', payload: 'Password reset link sent'});
//   } catch (error: any) {
//     const errorMessage = ErrorUtils.getErrorMessage(error);
//     dispatch({type: 'SET_WARNING', payload: errorMessage});
//   } finally {
//     dispatch({type: 'SET_RESET_PASSWORD_MODAL_VISIBLE', payload: false});
//   }
// };
