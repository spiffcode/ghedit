declare module "github" {
    interface Error {
        path: string;
        request: any;
        error: string;
    }
    
    class Github {
        constructor(options?: any);
        getUser(): User;
        getRepo(usernameOrFullname: string, repo?: string): Repository;
    }
    
    interface IWriteOptions {
        encode?: boolean,
        committer?: ICommitter,
        author?: IAuthor,
    }
    
    interface IAuthor {
        name: string,
        email: string,
    }
    
    interface ICommitter {
        name: string,
        email: string,
    }
    
    class Repository {
        constructor(options?: any);
        contents(ref: string, path: string, cb: (err: Error, contents?: any, xhr?: any) => void);
        write(branch: string, path: string, content: string, message: string, cb: (err: Error, response?: any, xhr?: any) => void);
        write(branch: string, path: string, content: string, message: string, options: any, cb: (err: Error, response?: any, xhr?: any) => void);
    }
    
    class User {
        repos(cb: (err: Error, repos?: any, xhr?: any) => void);
        repos(options: any, cb: (err: Error, repos?: any, xhr?: any) => void);
    }
}
