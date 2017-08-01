import navigation from './navigation';
import { createMenuLayout, createStrokeCanvas, connectLayout } from './layout';
import createModel from './model';
import { watchDrags } from './move';

/**
 * Create a Marking Menu.
 *
 * @param {List<String|{name,children}>} items - The list of items.
 * @param {HTMLElement} parentDOM - The parent node.
 * @param {Object} options - Configuration options for the menu.
 * @param {number} options.minSelectionDist - The minimum distance from the center to select an
 *                                            item.
 * @param {number} options.minMenuSelectionDist - The minimum distance from the center to open a
 *                                                sub-menu.
 * @param {number} options.subMenuOpeningDelay - The dwelling delay before opening a sub-menu.
 * @param {number} options.movementsThreshold - The minimum distance between two points to be
 *                                              considered a significant movements and breaking
 *                                              the sub-menu dwelling delay.
 * @param {number} options.noviceDwellingTime - The dwelling time required to trigger the novice
                                                mode (and open the menu).
 * @param {number} options.strokeColor - The color of the gesture stroke.
 * @param {number} options.strokeWidth - The width of the gesture stroke.
 * @param {number} options.strokeStartPointRadius - The radius of the start point of a stroke
 *                                                  (appearing at the middle of the menu in novice
 *                                                  mode)
 * @return {Observable} An observable on menu selections.
 */
export default (
  items,
  parentDOM,
  {
    minSelectionDist = 40,
    minMenuSelectionDist = 80,
    subMenuOpeningDelay = 25,
    movementsThreshold = 5,
    noviceDwellingTime = 1000 / 3,
    strokeColor = 'black',
    strokeWidth = 4,
    strokeStartPointRadius = 8
  } = {}
) => {
  // Create the display options
  const menuLayoutOptions = {};
  const strokeCanvasOptions = {
    lineColor: strokeColor,
    lineWidth: strokeWidth,
    pointRadius: strokeStartPointRadius
  };

  // Create model and navigation observable.
  const model = createModel(items);
  const navigation$ = navigation(watchDrags(parentDOM), model, {
    minSelectionDist,
    minMenuSelectionDist,
    subMenuOpeningDelay,
    movementsThreshold,
    noviceDwellingTime
  }).do(({ originalEvent }) => {
    // Prevent default on every notifications.
    if (originalEvent) originalEvent.preventDefault();
  });

  // Connect the engine notifications to menu opening/closing.
  const connectedNavigation$ = connectLayout(
    parentDOM,
    navigation$,
    (parent, menuModel, center, current) =>
      createMenuLayout(parent, menuModel, center, current, menuLayoutOptions),
    parent => createStrokeCanvas(parent, strokeCanvasOptions)
  );

  // Return an observable on the selections.
  return connectedNavigation$
    .filter(notification => notification.type === 'select')
    .pluck('selection')
    .share();
};
