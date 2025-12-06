// Lớp response chung
public class ApiResponse<T>
{
    public int Code { get; set; }
    public T Data { get; set; }
    public string? Message { get; set; }

    public ApiResponse() { }

    public ApiResponse(int code, T data, string? message = null)
    {
        Code = code;
        Data = data;
        Message = message;
    }
}
