using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using DataSample.Model;

namespace DataSample.Controllers
{
    public class ItemsController : ApiController
    {
        public IHttpActionResult Get(string path)
        {
            IHttpActionResult result = NotFound();

            var items = LookupItem.CreateItems();
            List<LookupItem> linkItems = LookupItem.GetLookupItems(path, items);


            result = Ok(linkItems);

            return result;
        }
    }
}
