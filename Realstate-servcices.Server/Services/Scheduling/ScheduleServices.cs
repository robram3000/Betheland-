//using AutoMapper;
//using Realstate_servcices.Server.Dto.Property;
//using Realstate_servcices.Server.Dto.Scheduling;
//using Realstate_servcices.Server.Entity.Properties;
//using Realstate_servcices.Server.Repository.ScheduleDao;

//namespace Realstate_servcices.Server.Services.Scheduling
//{
//    public class SchedulePropertiesService : ISchedulePropertiesService
//    {
//        private readonly ISchedulePropertiesRepository _scheduleRepository;
//        private readonly IMapper _mapper;

//        public SchedulePropertiesService(ISchedulePropertiesRepository scheduleRepository, IMapper mapper)
//        {
//            _scheduleRepository = scheduleRepository;
//            _mapper = mapper;
//        }

//        public async Task<ScheduleResponseDto?> GetScheduleAsync(int id)
//        {
//            var schedule = await _scheduleRepository.GetByIdAsync(id);
//            return schedule != null ? _mapper.Map<ScheduleResponseDto>(schedule) : null;
//        }

//        public async Task<IEnumerable<ScheduleResponseDto>> GetClientSchedulesAsync(int clientId)
//        {
//            var schedules = await _scheduleRepository.GetByClientIdAsync(clientId);
//            return _mapper.Map<IEnumerable<ScheduleResponseDto>>(schedules);
//        }

//        public async Task<IEnumerable<ScheduleResponseDto>> GetAgentSchedulesAsync(int agentId)
//        {
//            var schedules = await _scheduleRepository.GetByAgentIdAsync(agentId);
//            return _mapper.Map<IEnumerable<ScheduleResponseDto>>(schedules);
//        }

//        public async Task<IEnumerable<ScheduleResponseDto>> GetPropertySchedulesAsync(int propertyId)
//        {
//            var schedules = await _scheduleRepository.GetByPropertyIdAsync(propertyId);
//            return _mapper.Map<IEnumerable<ScheduleResponseDto>>(schedules);
//        }

//        public async Task<IEnumerable<ScheduleResponseDto>> GetUpcomingSchedulesAsync(int days = 7)
//        {
//            var schedules = await _scheduleRepository.GetUpcomingSchedulesAsync(days);
//            return _mapper.Map<IEnumerable<ScheduleResponseDto>>(schedules);
//        }

//        public async Task<ScheduleResponseDto> CreateScheduleAsync(CreateScheduleDto createDto)
//        {
//            // Check for scheduling conflicts
//            var conflict = await _scheduleRepository.ExistsAsync(createDto.PropertyId, createDto.ClientId, createDto.ScheduleTime);
//            if (conflict)
//            {
//                throw new InvalidOperationException("A schedule already exists for this property, client, and date.");
//            }

//            var schedule = new ScheduleProperties
//            {
//                PropertyId = createDto.PropertyId,
//                AgentId = createDto.AgentId,
//                ClientId = createDto.ClientId,
//                ScheduleTime = createDto.ScheduleTime,
//                Notes = createDto.Notes,
//                Status = "Scheduled",
//                CreatedAt = DateTime.UtcNow
//            };

//            var result = await _scheduleRepository.AddAsync(schedule);
//            return _mapper.Map<ScheduleResponseDto>(result);
//        }

//        public async Task<ScheduleResponseDto?> UpdateScheduleAsync(int id, UpdateScheduleDto updateDto)
//        {
//            var schedule = await _scheduleRepository.GetByIdAsync(id);
//            if (schedule == null) return null;

//            if (updateDto.ScheduleTime.HasValue)
//                schedule.ScheduleTime = updateDto.ScheduleTime.Value;

//            if (!string.IsNullOrEmpty(updateDto.Status))
//                schedule.Status = updateDto.Status;

//            if (updateDto.Notes != null)
//                schedule.Notes = updateDto.Notes;

//            await _scheduleRepository.UpdateAsync(schedule);
//            return _mapper.Map<ScheduleResponseDto>(schedule);
//        }

//        public async Task<ScheduleResponseDto?> UpdateScheduleStatusAsync(int id, ScheduleStatusDto statusDto)
//        {
//            var schedule = await _scheduleRepository.GetByIdAsync(id);
//            if (schedule == null) return null;

//            schedule.Status = statusDto.Status;
//            await _scheduleRepository.UpdateAsync(schedule);

//            return _mapper.Map<ScheduleResponseDto>(schedule);
//        }

//        public async Task<bool> CancelScheduleAsync(int id)
//        {
//            var schedule = await _scheduleRepository.GetByIdAsync(id);
//            if (schedule == null) return false;

//            schedule.Status = "Cancelled";
//            await _scheduleRepository.UpdateAsync(schedule);
//            return true;
//        }

//        public async Task<bool> DeleteScheduleAsync(int id)
//        {
//            var schedule = await _scheduleRepository.GetByIdAsync(id);
//            if (schedule == null) return false;

//            await _scheduleRepository.DeleteAsync(id);
//            return true;
//        }

//        public async Task<bool> IsScheduleConflictAsync(int propertyId, int agentId, DateTime scheduleTime)
//        {
//            return await _scheduleRepository.ExistsAsync(propertyId, agentId, scheduleTime);
//        }

//        public async Task<int> GetScheduleCountByStatusAsync(string status)
//        {
//            return await _scheduleRepository.GetScheduleCountByStatusAsync(status);
//        }
//    }
//}
