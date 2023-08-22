import {
    CreateDateColumn,
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  
  @Entity('Applicant')
  export class ApplicantEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    applicant_id: number;
  
    @Column({ nullable: true })
    company_id: number | null;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @Column({ default: false })
    isUploaded: boolean;
  
    @Column({ default: 0 })
    countDownloaded: number;
    // greeting 등록시 필요 컬럼
  
    @Column({ nullable: true })
    openingId: number;
  
    @Column({ nullable: false })
    name: string;
  
    @Column({ nullable: true })
    email: string | null;
  
    @Column({ nullable: true })
    phone: string | null;
  
    @Column({ nullable: true })
    referer: string | null;
  
    @Column({ nullable: false })
    optionalTermsAgree: boolean;
  
    //document
    @Column({ nullable: true })
    fileUrl: string | null;
  
    @Column({ nullable: true })
    filename: string | null;
  
    @Column({ nullable: true })
    fileToken: string | null;
  
    @Column({ nullable: true })
    docName: string | null;
  
    @Column({ nullable: true })
    application_date: string | null;
  
    @Column({ nullable: true })
    title: string;
  
    @Column({ nullable: true })
    status: string | null;
    // // questionnaires
    // @Column({ nullable: false })
    // question: string;
  
    // @Column({ nullable: false })
    // answer: string;
  
    // //additionalApplicantInfo
    // @Column({ nullable: true })
    // gender: string | null;
  
    // @Column({ nullable: true })
    // birthday: string | null;
  
    // @Column({ nullable: true })
    // careerType: string | null;
  
    // @Column({ nullable: true })
    // militaryService: string | null;
  
    // @Column({ nullable: true })
    // militaryStatus: string | null;
  
    // @Column({ nullable: true })
    // typeOfDisability: string | null;
  
    // @Column({ nullable: true })
    // isDisability: string | null;
  
    // @Column({ nullable: true })
    // severityOfSymptoms: string | null;
  
    // @Column({ nullable: true })
    // veteranStatus: string | null;
  
    // @Column({ nullable: true })
    // veteranCode: string | null;
  
    // //educationalBackgrounds
    // @Column({ nullable: true })
    // kind: string | null;
  
    // @Column({ nullable: true })
    // schoolName: string | null;
  
    // @Column({ nullable: true })
    // startDate: string | null;
  
    // @Column({ nullable: true })
    // endDate: string | null;
  
    // @Column({ nullable: true })
    // score: string | null;
  
    // @Column({ nullable: true })
    // majorField: string | null;
  
    // @Column({ nullable: true })
    // maxScore: string | null;
  
    // @Column({ nullable: true })
    // major: string | null;
  
    // @Column({ nullable: false })
    // isQualificationExaminer: boolean;
  
    // @Column({ nullable: true })
    // examinationForEntrancePassDate: string | null;
  
    // @Column({ nullable: true })
    // attending: boolean | null;
  
    // //carreers
    // @Column({ nullable: true })
    // tenureStartDate: string | null;
  
    // @Column({ nullable: true })
    // tenureEndDate: string | null;
  
    // @Column({ nullable: true })
    // position: string | null;
  
    // @Column({ nullable: true })
    // job: string | null;
  
    // @Column({ nullable: true })
    // inService: boolean | null;
  
    // @Column({ nullable: true })
    // company: string | null;
  
    // //certificates
    // @Column({ nullable: true })
    // credential: string | null;
  
    // @Column({ nullable: true })
    // issuer: string | null;
  
    // @Column({ nullable: true })
    // certificatesAcquisitionDate: string | null;
  
    // //languageSkills
    // @Column({ nullable: true })
    // examName: string | null;
  
    // @Column({ nullable: true })
    // languageSkillsAcquisitionDate: string | null;
  
    // @Column({ nullable: true })
    // grade: string | null;
  
    // @Column({ nullable: true })
    // language: string | null;
  }
  