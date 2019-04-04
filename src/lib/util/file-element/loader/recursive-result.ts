import RecursiveFileElement from "../recursive-file-element";
import LoadResult from "./result";

// TODO: the only reason theses are classes is so I can instanceof them, I have no idea if this is a good practice or not xd
// if it is, I'll probably make some other interface classes
export default class RecursiveLoadResult<E extends RecursiveFileElement<E>>
  extends LoadResult<E> {
  public errors: Map<string, Error>;
}