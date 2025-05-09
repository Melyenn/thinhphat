using Microsoft.AspNetCore.Mvc;

namespace YourProjectName.Controllers  // Thay YourProjectName
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        [HttpPost("submit-form")]
        public IActionResult SubmitForm([FromBody] FormData data)
        {
            if (data == null || string.IsNullOrEmpty(data.Name) || string.IsNullOrEmpty(data.Email) || string.IsNullOrEmpty(data.Subject) || string.IsNullOrEmpty(data.Message))
            {
                return BadRequest("Vui lòng cung cấp đầy đủ thông tin.");
            }

            Console.WriteLine("Dữ liệu nhận được:");
            Console.WriteLine($"Name: {data.Name}");
            Console.WriteLine($"Email: {data.Email}");
            Console.WriteLine($"Subject: {data.Subject}");
            Console.WriteLine($"Message: {data.Message}");

            //  *** XỬ LÝ DỮ LIỆU Ở ĐÂY (LƯU VÀO DATABASE, GỬI EMAIL, ...) ***

            return Ok(new { message = "Dữ liệu đã nhận thành công!" });
        }
    }
    

    public class FormData
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Subject { get; set; }
        public string Message { get; set; }
    }
}