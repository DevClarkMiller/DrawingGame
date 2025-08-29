import ServerContext, {SocketType} from './ServerContext';

export default abstract class SocketHandler{
    // INSTANCE MEMBERS
    protected ctx: ServerContext;
    protected socket: SocketType;

    // CTORS
    public constructor(context: ServerContext, socket: SocketType){
        this.ctx = context;
        this.socket = socket;
    }
}