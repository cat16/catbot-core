import FileElement from "..";

export default class LoadResult<E extends FileElement> {
  public element: E | Error;
  public found: boolean;
}
