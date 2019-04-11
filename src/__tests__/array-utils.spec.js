import {ArrayUtils} from '../index';

test('finds an object by comparing an specific field', () => {

  const array = [
    {title: 'A', summary: 'SA'},
    {title: 'B', summary: 'SB1'},
    {title: 'B', summary: 'SB2'},
    {title: 'C', summary: 'SC'}];

  const object = {title: 'B', summary: 'SB'};

  // It will return the first occurrence of an object with the same title as the object passed as second parameter
  const index = ArrayUtils.getObjectIndexInArrayByField(array, object, 'title');

  expect(index).toBe(1);
});

test('gets unique elements in an array ', () => {
  const array = [
    {title: 'A', summary: 'SA'},
    {title: 'B', summary: 'SB1'},
    {title: 'B', summary: 'SB2'},
    {title: 'B', summary: 'SB3'},
    {title: 'C', summary: 'SC'}];

  const expectedArray = [
    {title: 'A', summary: 'SA'},
    {title: 'B', summary: 'SB1'},
    {title: 'C', summary: 'SC'}];

  const arrayWithUniqueElements = ArrayUtils.getUniqueItemsInArrayByFieldName(array, 'title');

  expect(arrayWithUniqueElements).toEqual(expectedArray);
});

test('moves an object in an array from one position (index) to other', () => {
  const array = [{title: 'A'}, {title: 'B'}, {title: 'C'}];
  const arrayMoved = [{title: 'B'}, {title: 'C'}, {title: 'A'}];

  // Be aware this operation is mutable
  ArrayUtils.moveItemInArray(array, 0, 2);

  expect(array).toEqual(arrayMoved);
});