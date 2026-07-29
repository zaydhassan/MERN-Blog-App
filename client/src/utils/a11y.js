// Accessibility helper for non-semantic clickable elements.
//
// Some UI uses a <Box> (div) with onClick + cursor:pointer instead of a real
// button — that's not keyboard accessible and invisible to assistive tech.
// The accessible fix is to add role="button" + tabIndex={0} + a keydown
// handler that fires on Enter/Space. Pair this with those attributes:
//
//   <Box
//     role="button"
//     tabIndex={0}
//     onClick={handler}
//     onKeyDown={onActivate(handler)}
//   >
//
// `onActivate` wraps a click handler so it also fires on Enter and Space
// (Space is prevented to stop the page from scrolling).
export const onActivate = (handler) => (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handler(event);
  }
};