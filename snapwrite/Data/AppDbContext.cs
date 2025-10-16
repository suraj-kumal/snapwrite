using Microsoft.EntityFrameworkCore;
using snapwrite.Models;
namespace snapwrite.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users {get;set; }
        public DbSet<Document> Documents {get;set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).HasMaxLength(255);
                entity.Property(e => e.Name).HasMaxLength(100);
            });

            modelBuilder.Entity<Document>(entity =>
            {
                entity.Property(e=>e.Title).HasMaxLength(255);
                if (Database.ProviderName == "Microsoft.EntityFrameworkCore.Sqlite")
                {
                    entity.Property(e => e.Content).HasColumnType("TEXT");
                }
                else if (Database.ProviderName == "Pomelo.EntityFrameworkCore.MySql" ||
                         Database.ProviderName == "MySql.EntityFrameworkCore")
                {
                    entity.Property(e => e.Content).HasColumnType("LONGTEXT");
                }

                entity.HasOne(d=>d.User).WithMany(d => d.Documents).HasForeignKey(d=>d.UserId).OnDelete(DeleteBehavior.Cascade);

            });

            
        }
    }
}
