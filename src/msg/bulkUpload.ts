import {Movie} from "../entity/Movie";

export enum BulkUploadActionTypes {
    ADD = "ADD",
    UPDATE = "UPDARE",
    DELETE = "DELETE",
}

export interface BulkUpload {
    action: BulkUploadActionTypes,
    movies: Movie[]
}

export interface BulkUploadResponse {
    action: BulkUploadActionTypes,
    movie: Movie,
    reason: string,
    success:boolean;
}