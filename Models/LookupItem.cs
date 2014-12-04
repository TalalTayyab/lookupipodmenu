using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DataSample.Model
{
    public class LookupItem
    {
        public string Name { get; set; }

        public string Path { get; set; }

        public bool AllowNavigation
        {
            get
            {
                return Children != null && Children.Count > 0;
            }
        }

        /// <summary>
        /// The children of this item.
        /// </summary>
        public List<LookupItem> Children { get; set; }



        public static LookupItem[] CreateMSIGaming()
        {
            return new LookupItem[] 
            {
                new LookupItem() 
                {
                    Name = "GS60 Ghost Pro"
                },
                new LookupItem() 
                {
                    Name = "GS70 Stealth Pro"
                },
                new LookupItem()
                {
                    Name = "GT72 Dominator"
                },
                new LookupItem()
                {
                    Name = "GT70 Dominator"
                },
                new LookupItem()
                {
                    Name = "GT60 Dominator"
                },

            };
        }

        public static LookupItem[] CreateGBGaming()
        {
            return new LookupItem[] 
            {
                new LookupItem() 
                {
                    Name = "P17F"
                },
                new LookupItem() 
                {
                    Name = "P35X v3"
                },
                new LookupItem()
                {
                    Name = "P35W v3"
                },
                new LookupItem()
                {
                    Name = "G3"
                },
                new LookupItem()
                {
                    Name = "P25X v2"
                },
                 new LookupItem()
                {
                    Name = "P25W v2"
                },
            };
        }

        public static LookupItem[] CreateDellGaming()
        {
            return new LookupItem[] 
            {
                new LookupItem() 
                {
                    Name = "Alienware 13"
                },
                new LookupItem() 
                {
                    Name = "Alienware 14"
                },
                new LookupItem() 
                {
                    Name = "Alienware 17"
                },
                new LookupItem()
                {
                    Name = "Alienware 18"
                }
            };
        }

        public static LookupItem[] CreateGaming()
        {
            return new LookupItem[] 
            {
                new LookupItem() 
                {
                    Name = "MSI",
                    Children = CreateMSIGaming().ToList()
                },
                new LookupItem() 
                {
                    Name = "Gigabyte",
                    Children =  CreateGBGaming().ToList()
                },
                new LookupItem() 
                {
                    Name = "Dell",
                    Children = CreateDellGaming().ToList()
                }
            };
        }

        public static LookupItem[] CreateLaptop()
        {
            return new LookupItem[] 
            {
               new LookupItem() 
                {
                    Name = "Dell"
                },
                new LookupItem() 
                {
                    Name = "Lenovo"
                },
                new LookupItem() 
                {
                    Name = "HP"
                }
            };
        }

        public static LookupItem[] CreatUltraBook()
        {
            return new LookupItem[] 
            {
               new LookupItem() 
                {
                    Name = "Dell"
                },
                new LookupItem() 
                {
                    Name = "Lenovo"
                },
                new LookupItem() 
                {
                    Name = "HP"
                }
            };
        }

        public static LookupItem[] CreateMobile()
        {
            return new LookupItem[] 
            {
               new LookupItem() 
                {
                    Name = "Gaming",
                     Children = CreateGaming().ToList()
                },
                new LookupItem() 
                {
                    Name = "Laptop",
                    Children = CreateLaptop().ToList()
                },
                new LookupItem() 
                {
                    Name = "UltraBooks",
                    Children = CreatUltraBook().ToList()
                }
            };
        }

        public static List<LookupItem> CreateItems()
        {
            List<LookupItem> items = new List<LookupItem>();

            items.Add(new LookupItem()
            {
                Name = "Mobile",
                Children = CreateMobile().ToList()

            });

            
            SetPath(items);

            return items;
        }//


        public static void SetPath(List<LookupItem> items, string path = "")
        {
            if (items != null)
            {
                foreach (var item in items)
                {
                    if (String.IsNullOrEmpty(path))
                        item.Path = item.Name;
                    else
                        item.Path = String.Format(@"{0}\{1}", path, item.Name);

                    if (item.Children != null)
                    {
                        SetPath(item.Children, item.Path);
                    }
                }
            }
        }


        public static List<LookupItem> GetLookupItems(string completePath, List<LookupItem> allItems)
        {
            List<LookupItem> items = allItems;



            if (allItems != null && !String.IsNullOrEmpty(completePath))
            {
                //Pentana\Collection\folder1
                string[] pathItems = completePath.Split(@"\".ToCharArray());

                //We first select all the parents until the last one. The last item should be a starts with as it is not an exact match
                for (int i = 0; i < pathItems.Count() - 1; i++)
                {
                    if (items != null)
                    {
                        string name = pathItems[i];
                        LookupItem item = items.Where(e => String.Equals(e.Name, name, StringComparison.InvariantCultureIgnoreCase)).FirstOrDefault();

                        if (item != null)
                            items = item.Children ?? new List<LookupItem>();
                        else
                            items = new List<LookupItem>();
                    }
                }

                string pathItem = pathItems[pathItems.Count() - 1];
                items = items.Where(e => e.Name.StartsWith(pathItem, StringComparison.InvariantCultureIgnoreCase)).ToList();
            }

            return items;
        }




    }
}