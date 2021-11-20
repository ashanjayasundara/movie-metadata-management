import fs from "fs";

export const getCurrentDate = (date?: Date) => {
    const currentDate = date ? date : new Date();
    const month = currentDate.getUTCMonth() + 1;
    return currentDate.getFullYear() + "/" + (month < 10 ? "0" + month : month) + "/" + currentDate.getUTCDate();
};

export const makeDirectory = (path: string): string => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive: true});
    }
    return path;
};


export const WriteToCsv = (path: string, headers: string[]): string => {
    fs.writeFileSync(path, headers.join(",") + "\n");
    return path;
};
export const appendToCsv = (path: string, data: string[]) => {
    fs.appendFileSync(path, data.join(",") + "\n");
    return path;
};