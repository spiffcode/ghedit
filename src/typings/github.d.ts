declare module "github" {
    interface Error {
        path: string;
        request: any;
        error: string;
    }
    
    class Github {
        repo: string;
        ref: string;

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
        show(cb: (err: Error, info?: any, xhr?: any) => void);
        contents(ref: string, path: string, cb: (err: Error, contents?: any, xhr?: any) => void);
        write(branch: string, path: string, content: string, message: string, cb: (err: Error, response?: any, xhr?: any) => void);
        write(branch: string, path: string, content: string, message: string, options: any, cb: (err: Error, response?: any, xhr?: any) => void);
    }
    
	class Gist {
        description: string;
        files: any[];
        updated_at: string;

        read(cb: (err: Error, content?: any, xhr?: any) => void);
        create(options: any, cb: (err: Error, gist?: Gist, xhr?: any) => void);
        delete(cb: (err: Error) => void);
        update(options: any, cb: (err:Error, gist?: Gist, xhr?: any) => void);   
    }

    class User {
        repos(cb: (err: Error, repos?: any, xhr?: any) => void);
        repos(options: any, cb: (err: Error, repos?: any, xhr?: any) => void);
        gists(cb: (err: Error, gists?: Gist[], xhr?: any) => void);        
        show(username: string, cb: (err: Error, info?: UserInfo, xhr?: any) => void);
    }

		interface UserInfo {
			login: string;
			id: Number;
			avatar_url?: string;
			name?: string;
			email?: string;
		}
}
