/** Mount point for toast notifications. */
export default function ToastContainer() {
  return (
    <div id="toastContainer" className="toast-container" aria-live="polite">
      <div id="toastStack" style={{ display: 'contents' }} />
    </div>
  );
}
